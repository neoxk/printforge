<?php

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Persist the design session id (set by assets/js/frontend.js) onto the cart
 * item. The customer's artwork previews are uploaded to the backend under this
 * same id (temp/{sessionId}/...), so the id is what links a placed order back to
 * its uploaded design files.
 */
function printforge_configurator_add_cart_item_data(
    array $cart_item_data,
    int $product_id,
    int $variation_id = 0,
    int $quantity = 1
): array {
    $session_id = isset($_POST['printforge_session_id'])
        ? sanitize_text_field(wp_unslash($_POST['printforge_session_id']))
        : '';

    if ($session_id === '') {
        return $cart_item_data;
    }

    $cart_item_data['printforge_session_id'] = $session_id;

    // Fold the session id into the uniqueness key so two otherwise-identical
    // configurations carrying different artwork are not merged into one line.
    // Runs at priority 20, after the printforge options plugin sets its own key.
    $existing_key = isset($cart_item_data['printforge_unique_key'])
        ? (string) $cart_item_data['printforge_unique_key']
        : '';
    $cart_item_data['printforge_unique_key'] = md5($existing_key . $session_id);

    return $cart_item_data;
}

/**
 * Surface a lightweight marker in the cart/checkout so the shopper sees their
 * design is attached, without exposing the raw session id.
 */
function printforge_configurator_get_cart_item_data(array $item_data, array $cart_item): array
{
    if (empty($cart_item['printforge_session_id'])) {
        return $item_data;
    }

    $item_data[] = [
        'key'   => __('Custom design', 'printforge-configurator'),
        'value' => __('Attached', 'printforge-configurator'),
    ];

    return $item_data;
}

/**
 * Carry the session id onto the order line item so the design files can be
 * assigned to the order server-side (POST /api/storage/orders/:orderId/assign).
 */
function printforge_configurator_add_order_line_item_meta(
    WC_Order_Item_Product $item,
    string $cart_item_key,
    array $values,
    WC_Order $order
): void {
    if (empty($values['printforge_session_id'])) {
        return;
    }

    $item->add_meta_data('_printforge_session_id', (string) $values['printforge_session_id'], true);
}
