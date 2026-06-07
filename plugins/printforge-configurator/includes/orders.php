<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * When an order is placed (right before payment), move the customer's uploaded
 * artwork from its temporary session location into the order on the PrintForge
 * backend: POST {api}/api/storage/orders/{orderId}/assign.
 *
 * The design session ids were stored on each order line item as
 * `_printforge_session_id` (see includes/cart.php).
 *
 * Set to true to abort checkout when the assignment fails, false to let the
 * order through and only flag it. Flip this single switch to change behaviour.
 */
const PRINTFORGE_CONFIGURATOR_BLOCK_ON_ASSIGN_FAILURE = true;

/**
 * Hooked on `woocommerce_checkout_order_processed` (classic checkout). Accepts
 * the order id; throws a plain Exception to abort checkout before payment.
 */
function printforge_configurator_assign_designs_on_checkout($order_id): void
{
    printforge_configurator_assign_designs_to_order($order_id, false);
}

/**
 * Hooked on `woocommerce_store_api_checkout_order_processed` (block checkout).
 * Receives the order object; rethrows failures as a RouteException so the Store
 * API surfaces a clean checkout error instead of a 500.
 */
function printforge_configurator_assign_designs_on_store_api_checkout($order): void
{
    printforge_configurator_assign_designs_to_order($order, true);
}

/**
 * @param int|WC_Order $order_or_id
 * @param bool         $is_store_api Throw a Store API RouteException on failure.
 */
function printforge_configurator_assign_designs_to_order($order_or_id, bool $is_store_api): void
{
    $order = $order_or_id instanceof WC_Order ? $order_or_id : wc_get_order($order_or_id);

    if (!$order instanceof WC_Order) {
        return;
    }

    // Idempotency: never move the same order's files twice.
    if ($order->get_meta('_printforge_designs_assigned')) {
        return;
    }

    $session_ids = printforge_configurator_collect_session_ids($order);

    if ($session_ids === []) {
        return;
    }

    $api_base = printforge_configurator_get_api_base_url();
    $secret   = printforge_configurator_get_secret();

    if ($api_base === '' || $secret === '') {
        printforge_configurator_handle_assign_failure(
            $order,
            __('PrintForge is not fully configured (missing Public API URL or Plugin secret).', 'printforge-configurator'),
            $is_store_api
        );
        return;
    }

    $result = printforge_configurator_call_assign_api($api_base, $secret, (string) $order->get_id(), $session_ids);

    if (is_wp_error($result)) {
        printforge_configurator_handle_assign_failure($order, $result->get_error_message(), $is_store_api);
        return;
    }

    $order->update_meta_data('_printforge_designs_assigned', current_time('mysql'));
    $order->delete_meta_data('_printforge_assign_failed');
    $order->save();
}

/**
 * Gather the unique design session ids attached to the order's line items.
 *
 * @return string[]
 */
function printforge_configurator_collect_session_ids(WC_Order $order): array
{
    $session_ids = [];

    foreach ($order->get_items() as $item) {
        $session_id = $item->get_meta('_printforge_session_id', true);

        if (is_string($session_id) && trim($session_id) !== '') {
            $session_ids[trim($session_id)] = true;
        }
    }

    return array_keys($session_ids);
}

/**
 * @param string[] $session_ids
 * @return true|WP_Error
 */
function printforge_configurator_call_assign_api(string $api_base, string $secret, string $order_id, array $session_ids)
{
    $url = $api_base . '/api/storage/orders/' . rawurlencode($order_id) . '/assign';

    $response = wp_remote_post($url, [
        'timeout' => 8,
        'headers' => [
            'Content-Type'         => 'application/json',
            'X-PrintForge-Secret'  => $secret,
        ],
        'body' => wp_json_encode(['sessionIds' => array_values($session_ids)]),
    ]);

    if (is_wp_error($response)) {
        return new WP_Error('printforge_assign_failed', $response->get_error_message());
    }

    $status = (int) wp_remote_retrieve_response_code($response);

    if ($status < 200 || $status >= 300) {
        $body    = json_decode((string) wp_remote_retrieve_body($response), true);
        $message = is_array($body) && !empty($body['message']) && is_string($body['message'])
            ? $body['message']
            : sprintf(__('PrintForge backend returned status %d.', 'printforge-configurator'), $status);

        return new WP_Error('printforge_assign_failed', $message);
    }

    return true;
}

/**
 * Records the failure on the order and, when blocking is enabled, aborts
 * checkout with an exception appropriate to the checkout flow.
 */
function printforge_configurator_handle_assign_failure(WC_Order $order, string $message, bool $is_store_api): void
{
    $logger = function_exists('wc_get_logger') ? wc_get_logger() : null;
    if ($logger) {
        $logger->error(
            sprintf('Design assignment failed for order #%d: %s', $order->get_id(), $message),
            ['source' => 'printforge-configurator']
        );
    }

    $order->add_order_note(
        sprintf(__('PrintForge could not attach the uploaded design(s): %s', 'printforge-configurator'), $message)
    );
    $order->update_meta_data('_printforge_assign_failed', current_time('mysql'));
    $order->save();

    if (!PRINTFORGE_CONFIGURATOR_BLOCK_ON_ASSIGN_FAILURE) {
        return;
    }

    $customer_message = __('We could not attach your custom design to this order. Please try again in a moment.', 'printforge-configurator');

    if ($is_store_api && class_exists('\Automattic\WooCommerce\StoreApi\Exceptions\RouteException')) {
        throw new \Automattic\WooCommerce\StoreApi\Exceptions\RouteException(
            'printforge_assign_failed',
            $customer_message,
            409
        );
    }

    throw new Exception($customer_message);
}
