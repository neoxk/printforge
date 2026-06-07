<?php

if (!defined('ABSPATH')) {
    exit;
}

// [PF-DEBUG] Writes to a fixed file inside the container (/tmp/pf-debug.log)
// so the output is readable via `docker exec`, independent of where PHP's
// error_log directive points. Remove this and all callers when fixed.
function printforge_debug_log(string $message): void
{
    error_log('[PF-DEBUG] ' . $message . "\n", 3, '/tmp/pf-debug.log');
}

function printforge_validate_add_to_cart(
    bool $passed,
    int $product_id,
    int $quantity,
    int $variation_id = 0,
    array $variations = []
): bool {
    // [PF-DEBUG] Validation hook fired — proves the add-to-cart POST reached
    // WooCommerce. Logs which printforge_* fields arrived so we can tell a
    // missing-field problem from a server-validation problem. Remove when fixed.
    printforge_debug_log(sprintf(
        'validate_add_to_cart: product=%d qty=%d passed=%s post_keys=[%s] has_config_field=%s has_designer_field=%s config_len=%d',
        $product_id,
        $quantity,
        $passed ? 'true' : 'false',
        implode(',', array_keys($_POST)),
        isset($_POST['printforge_configuration']) ? 'yes' : 'no',
        isset($_POST['printforge_designer_configuration']) ? 'yes' : 'no',
        isset($_POST['printforge_configuration']) ? strlen((string) $_POST['printforge_configuration']) : 0
    ));

    if (!$passed) {
        printforge_debug_log('validate_add_to_cart: returning false — an earlier validation filter already failed ($passed=false)');
        return false;
    }

    $raw_configuration = isset($_POST['printforge_configuration'])
        ? wp_unslash($_POST['printforge_configuration'])
        : '';

    if (!is_string($raw_configuration) || trim($raw_configuration) === '') {
        $has_config = printforge_product_has_config($product_id);
        printforge_debug_log(sprintf(
            'validate_add_to_cart: printforge_configuration is EMPTY; product_has_config=%s',
            $has_config ? 'true' : 'false'
        ));
        if ($has_config) {
            printforge_debug_log('validate_add_to_cart: BLOCKING add — required configuration field is empty');
            wc_add_notice(__('Please choose the PrintForge options before adding this product to the cart.', 'printforge'), 'error');
            return false;
        }

        printforge_debug_log('validate_add_to_cart: allowing add — product has no config so empty configuration is OK');
        return true;
    }

    $verified = printforge_verify_configuration($product_id, $raw_configuration, $quantity);

    if (is_wp_error($verified)) {
        printforge_debug_log(sprintf(
            'validate_add_to_cart: BLOCKING add — verify_configuration returned WP_Error: %s',
            $verified->get_error_message()
        ));
        wc_add_notice($verified->get_error_message(), 'error');
        return false;
    }

    printforge_debug_log('validate_add_to_cart: PASSED — item allowed into cart');
    $GLOBALS['printforge_verified_cart_item'][$product_id] = $verified;

    return true;
}

function printforge_allow_configured_product_purchase(bool $purchasable, WC_Product $product): bool
{
    if ($purchasable) {
        return true;
    }

    $price = $product->get_price();

    if ($price !== '' && $price !== null) {
        return $purchasable;
    }

    return printforge_product_has_config($product->get_id());
}

function printforge_add_cart_item_data(
    array $cart_item_data,
    int $product_id,
    int $variation_id = 0,
    int $quantity = 1
): array {
    $verified = $GLOBALS['printforge_verified_cart_item'][$product_id] ?? null;

    if (!is_array($verified)) {
        $raw_configuration = isset($_POST['printforge_configuration'])
            ? wp_unslash($_POST['printforge_configuration'])
            : '';

        if (is_string($raw_configuration) && trim($raw_configuration) !== '') {
            $verified = printforge_verify_configuration($product_id, $raw_configuration, $quantity);
        }
    }

    if (is_wp_error($verified) || !is_array($verified)) {
        return $cart_item_data;
    }

    $cart_item_data['printforge'] = $verified;
    $cart_item_data['printforge_unique_key'] = md5(wp_json_encode($verified['configuration']));

    return $cart_item_data;
}

function printforge_apply_cart_item_price(WC_Cart $cart): void
{
    if (is_admin() && !wp_doing_ajax()) {
        return;
    }

    foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
        if (!isset($cart_item['printforge']['pricing']['total'], $cart_item['data']) || !is_object($cart_item['data'])) {
            continue;
        }

        $quantity = isset($cart_item['quantity']) ? max(1, (int) $cart_item['quantity']) : 1;
        $stored_quantity = isset($cart_item['printforge']['configuration']['context']['quantity'])
            ? (int) $cart_item['printforge']['configuration']['context']['quantity']
            : 0;

        if ($stored_quantity !== $quantity) {
            $verified = printforge_recalculate_verified_configuration($cart_item['printforge'], $quantity);

            if (is_wp_error($verified)) {
                $cart_item['printforge']['pricingError'] = $verified->get_error_message();
                $cart_item['printforge']['pricingErrorProductName'] = $cart_item['data']->get_name();
            } else {
                $cart_item['printforge'] = $verified;
            }

            $cart->cart_contents[$cart_item_key]['printforge'] = $cart_item['printforge'];
        }

        $base_price = printforge_get_current_cart_item_base_price($cart_item);
        $cart->cart_contents[$cart_item_key]['printforge']['configuration']['wooBasePrice'] = $base_price;
        $cart_item['data']->set_price(printforge_get_current_cart_item_configured_unit_price($cart_item));
    }
}

function printforge_validate_cart_pricing(): void
{
    if (!WC()->cart) {
        return;
    }

    foreach (WC()->cart->get_cart() as $cart_item) {
        if (empty($cart_item['printforge']['pricingError'])) {
            continue;
        }

        $product_name = !empty($cart_item['printforge']['pricingErrorProductName'])
            ? (string) $cart_item['printforge']['pricingErrorProductName']
            : (!empty($cart_item['data']) && is_object($cart_item['data']) && method_exists($cart_item['data'], 'get_name')
                ? (string) $cart_item['data']->get_name()
                : __('this product', 'printforge'));

        wc_add_notice(
            sprintf(
                __('The PrintForge options for "%s" are no longer valid. Please remove it from the cart and add it again.', 'printforge'),
                $product_name
            ),
            'error'
        );
        return;
    }
}

function printforge_get_cart_item_data(array $item_data, array $cart_item): array
{
    if (empty($cart_item['printforge']) || !is_array($cart_item['printforge'])) {
        return $item_data;
    }

    $rows = [];
    $context = $cart_item['printforge']['configuration']['context'] ?? [];

    if (is_array($context)) {
        $rows[] = sprintf(
            '<span class="printforge-cart-option-row"><span class="printforge-cart-option-row__label">%s:</span> %s</span>',
            esc_html__('Dimensions', 'printforge'),
            esc_html(printforge_format_dimensions($context))
        );
    }

    foreach (printforge_get_verified_option_rows($cart_item['printforge']) as $option) {
        $value_parts = [
            $option['item'],
            printforge_format_plain_price((float) $option['cost'], (string) $option['calculationBasis']),
        ];

        $rows[] = sprintf(
            '<span class="printforge-cart-option-row"><span class="printforge-cart-option-row__label">%s:</span> %s</span>',
            esc_html($option['container']),
            esc_html(implode(' - ', $value_parts))
        );
    }

    if ($rows !== []) {
        $item_data[] = [
            'key' => '',
            'value' => '',
            'display' => implode('', $rows),
        ];
    }

    return $item_data;
}

function printforge_get_cart_item_price(string $price, array $cart_item, string $cart_item_key): string
{
    if (empty($cart_item['printforge'])) {
        return $price;
    }

    return wc_price(printforge_get_current_cart_item_configured_unit_price($cart_item));
}

function printforge_get_current_cart_item_configured_unit_price(array $cart_item): float
{
    $base_price = printforge_get_current_cart_item_base_price($cart_item);
    $quantity = isset($cart_item['quantity']) ? max(1, (int) $cart_item['quantity']) : 1;
    $options_total = isset($cart_item['printforge']['pricing']['total']) && is_numeric($cart_item['printforge']['pricing']['total'])
        ? (float) $cart_item['printforge']['pricing']['total']
        : 0.0;

    return $base_price + ($options_total / $quantity);
}

function printforge_get_current_cart_item_base_price(array $cart_item): float
{
    $product_id = !empty($cart_item['variation_id'])
        ? (int) $cart_item['variation_id']
        : (int) ($cart_item['product_id'] ?? 0);
    $product = $product_id > 0 ? wc_get_product($product_id) : null;

    if ($product instanceof WC_Product) {
        return printforge_normalize_woo_price($product->get_price());
    }

    return isset($cart_item['printforge']['configuration']['wooBasePrice'])
        ? (float) $cart_item['printforge']['configuration']['wooBasePrice']
        : 0.0;
}

function printforge_normalize_woo_price($price): float
{
    return is_numeric($price) ? max(0.0, (float) $price) : 0.0;
}

function printforge_add_order_line_item_meta(
    WC_Order_Item_Product $item,
    string $cart_item_key,
    array $values,
    WC_Order $order
): void {
    if (empty($values['printforge']) || !is_array($values['printforge'])) {
        return;
    }

    $options = printforge_get_verified_option_labels($values['printforge']);
    foreach ($options as $option) {
        $item->add_meta_data($option['container'], $option['items'], true);
    }

    $context = $values['printforge']['configuration']['context'] ?? [];
    if (is_array($context)) {
        $item->add_meta_data(__('Dimensions', 'printforge'), printforge_format_dimensions($context), true);
    }

    $item->add_meta_data('_printforge_configuration', wp_json_encode($values['printforge']['configuration']), true);
    $item->add_meta_data('_printforge_pricing', wp_json_encode($values['printforge']['pricing']), true);
}
