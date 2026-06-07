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

/* -------------------------------------------------------------------------
 * Order admin: per-line-item design downloads
 *
 * On the order edit screen each line item with an attached design gets one
 * download link per design file. The file list is fetched from the backend
 * (GET {api}/api/storage/orders/{orderId}/{sessionId}); each link points at an
 * admin-post handler that proxies the bytes from the backend so nothing in S3
 * is exposed publicly and the existing internal API URL/secret are reused.
 * ---------------------------------------------------------------------- */

/**
 * Fetch the list of design filenames for one order/session from the backend.
 * Cached per request so the same session id isn't fetched twice while the order
 * screen renders. Fails soft: returns [] on any error so the page never breaks.
 *
 * @return string[]
 */
function printforge_configurator_fetch_design_files(string $order_id, string $session_id): array
{
    static $cache = [];

    $cache_key = $order_id . '|' . $session_id;
    if (isset($cache[$cache_key])) {
        return $cache[$cache_key];
    }

    $api_base = printforge_configurator_get_api_base_url();
    $secret   = printforge_configurator_get_secret();

    if ($api_base === '' || $secret === '') {
        return $cache[$cache_key] = [];
    }

    $url = $api_base . '/api/storage/orders/' . rawurlencode($order_id) . '/' . rawurlencode($session_id);

    $response = wp_remote_get($url, [
        'timeout' => 5,
        'headers' => ['X-PrintForge-Secret' => $secret],
    ]);

    if (is_wp_error($response) || (int) wp_remote_retrieve_response_code($response) !== 200) {
        return $cache[$cache_key] = [];
    }

    $body  = json_decode((string) wp_remote_retrieve_body($response), true);
    $files = [];

    if (is_array($body) && isset($body['files']) && is_array($body['files'])) {
        foreach ($body['files'] as $file) {
            if (is_array($file) && isset($file['filename']) && is_string($file['filename'])) {
                $files[] = $file['filename'];
            }
        }
    }

    return $cache[$cache_key] = $files;
}

/**
 * Hooked on `woocommerce_after_order_itemmeta`. Renders a download link per
 * design file under each line item that carries a `_printforge_session_id`.
 *
 * @param int                   $item_id
 * @param WC_Order_Item|mixed   $item
 */
function printforge_configurator_render_item_designs($item_id, $item): void
{
    if (!$item instanceof WC_Order_Item) {
        return;
    }

    $session_id = $item->get_meta('_printforge_session_id', true);
    if (!is_string($session_id) || trim($session_id) === '') {
        return;
    }

    $order = $item->get_order();
    if (!$order instanceof WC_Order) {
        return;
    }

    $order_id = (string) $order->get_id();
    $files    = printforge_configurator_fetch_design_files($order_id, trim($session_id));

    if ($files === []) {
        return;
    }

    echo '<div class="printforge-designs" style="margin-top:8px">';
    echo '<strong>' . esc_html__('PrintForge designs', 'printforge-configurator') . '</strong>';
    echo '<ul style="margin:4px 0 0">';

    foreach ($files as $filename) {
        $download_url = wp_nonce_url(
            add_query_arg(
                [
                    'action' => 'printforge_download_design',
                    'order'  => $order_id,
                    'item'   => $item_id,
                    'file'   => rawurlencode($filename),
                ],
                admin_url('admin-post.php')
            ),
            'printforge_download_design_' . $order_id . '_' . $item_id
        );

        printf(
            '<li><a href="%s">%s</a></li>',
            esc_url($download_url),
            esc_html($filename)
        );
    }

    echo '</ul></div>';
}

/**
 * Hooked on `admin_post_printforge_download_design`. Streams a single design
 * file to the admin by proxying it from the backend. The session id is
 * re-derived from the order line item (never taken from the URL), so the
 * request is scoped to the exact item the admin is permitted to view.
 */
function printforge_configurator_handle_design_download(): void
{
    if (!current_user_can('manage_woocommerce')) {
        wp_die(esc_html__('You are not allowed to download this file.', 'printforge-configurator'), 403);
    }

    $order_id = isset($_GET['order']) ? absint($_GET['order']) : 0;
    $item_id  = isset($_GET['item']) ? absint($_GET['item']) : 0;
    $filename = isset($_GET['file']) ? basename(sanitize_file_name(rawurldecode((string) $_GET['file']))) : '';

    check_admin_referer('printforge_download_design_' . $order_id . '_' . $item_id);

    if ($order_id === 0 || $item_id === 0 || $filename === '') {
        wp_die(esc_html__('Invalid download request.', 'printforge-configurator'), 400);
    }

    $order = wc_get_order($order_id);
    if (!$order instanceof WC_Order) {
        wp_die(esc_html__('Order not found.', 'printforge-configurator'), 404);
    }

    $item = $order->get_item($item_id);
    if (!$item instanceof WC_Order_Item) {
        wp_die(esc_html__('Order item not found.', 'printforge-configurator'), 404);
    }

    $session_id = $item->get_meta('_printforge_session_id', true);
    if (!is_string($session_id) || trim($session_id) === '') {
        wp_die(esc_html__('No design is attached to this item.', 'printforge-configurator'), 404);
    }

    $api_base = printforge_configurator_get_api_base_url();
    $secret   = printforge_configurator_get_secret();

    if ($api_base === '' || $secret === '') {
        wp_die(esc_html__('PrintForge is not fully configured.', 'printforge-configurator'), 500);
    }

    $url = $api_base . '/api/storage/orders/'
        . rawurlencode((string) $order_id) . '/'
        . rawurlencode(trim($session_id)) . '/'
        . rawurlencode($filename);

    $response = wp_remote_get($url, [
        'timeout' => 15,
        'headers' => ['X-PrintForge-Secret' => $secret],
    ]);

    if (is_wp_error($response)) {
        wp_die(esc_html($response->get_error_message()), 502);
    }

    $status = (int) wp_remote_retrieve_response_code($response);
    if ($status < 200 || $status >= 300) {
        wp_die(esc_html__('Could not download the design file.', 'printforge-configurator'), $status ?: 502);
    }

    $body         = wp_remote_retrieve_body($response);
    $content_type = wp_remote_retrieve_header($response, 'content-type');

    nocache_headers();
    header('Content-Type: ' . ($content_type !== '' ? $content_type : 'application/octet-stream'));
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . strlen($body));

    echo $body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- raw binary file
    exit;
}
