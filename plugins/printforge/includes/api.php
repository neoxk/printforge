<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_product_has_config(int $woo_product_id): bool
{
    $config = printforge_fetch_product_config($woo_product_id);
    return is_array($config);
}

function printforge_verify_configuration(int $woo_product_id, string $raw_configuration, int $quantity = 1)
{
    $configuration = json_decode($raw_configuration, true);

    if (!is_array($configuration)) {
        return new WP_Error('printforge_invalid_configuration', __('Invalid PrintForge configuration.', 'printforge'));
    }

    $config = printforge_fetch_product_config($woo_product_id);
    if (is_wp_error($config)) {
        return $config;
    }

    $selected_item_ids = printforge_sanitize_selected_item_ids($configuration['selectedItemIds'] ?? null);
    $context = printforge_sanitize_pricing_context($configuration['context'] ?? null);

    if (is_wp_error($selected_item_ids)) {
        return $selected_item_ids;
    }

    if (is_wp_error($context)) {
        return $context;
    }

    $context = printforge_apply_config_dimensions($context, $config);
    if (is_wp_error($context)) {
        return $context;
    }

    $context['quantity'] = max(1, $quantity);

    $pricing = printforge_calculate_price($config['productId'], $selected_item_ids, $context);
    if (is_wp_error($pricing)) {
        return $pricing;
    }

    return [
        'configuration' => [
            'productId' => $config['productId'],
            'wooProductId' => $woo_product_id,
            'wooBasePrice' => printforge_get_woo_base_price($woo_product_id),
            'selectedItemIds' => $selected_item_ids,
            'context' => $context,
        ],
        'pricing' => $pricing,
        'displayOptions' => printforge_get_selected_option_labels($config, $selected_item_ids),
    ];
}

function printforge_recalculate_verified_configuration(array $printforge, int $quantity)
{
    if (
        empty($printforge['configuration']['productId'])
        || empty($printforge['configuration']['selectedItemIds'])
        || empty($printforge['configuration']['context'])
        || !is_array($printforge['configuration']['selectedItemIds'])
        || !is_array($printforge['configuration']['context'])
    ) {
        return $printforge;
    }

    $context = $printforge['configuration']['context'];
    $context['quantity'] = max(1, $quantity);
    $pricing = printforge_calculate_price(
        (string) $printforge['configuration']['productId'],
        $printforge['configuration']['selectedItemIds'],
        $context
    );

    if (is_wp_error($pricing)) {
        return $pricing;
    }

    $printforge['configuration']['context'] = $context;
    $printforge['pricing'] = $pricing;
    unset($printforge['pricingError']);

    return $printforge;
}

function printforge_apply_config_dimensions(array $context, array $config)
{
    $dimensions = $config['dimensions'] ?? null;

    if (!is_array($dimensions) || ($dimensions['type'] ?? '') !== 'fixed') {
        return $context;
    }

    $width_mm = isset($dimensions['widthMm']) ? (float) $dimensions['widthMm'] : 0.0;
    $height_mm = isset($dimensions['heightMm']) ? (float) $dimensions['heightMm'] : 0.0;

    if ($width_mm <= 0 || $height_mm <= 0) {
        return new WP_Error('printforge_invalid_context', __('Invalid PrintForge dimensions.', 'printforge'));
    }

    $context['widthMm'] = $width_mm;
    $context['heightMm'] = $height_mm;

    return $context;
}

function printforge_get_woo_base_price(int $woo_product_id): float
{
    $product = wc_get_product($woo_product_id);

    if (!$product instanceof WC_Product) {
        return 0.0;
    }

    return printforge_normalize_woo_price($product->get_price());
}

function printforge_fetch_product_config(int $woo_product_id)
{
    $url = printforge_get_api_base_url() . '/products/woo/' . rawurlencode((string) $woo_product_id) . '/config';
    $response = wp_remote_get($url, ['timeout' => 10]);

    return printforge_parse_api_response($response, __('This product is not configured in PrintForge.', 'printforge'));
}

function printforge_calculate_price(string $product_id, array $selected_item_ids, array $context)
{
    $url = printforge_get_api_base_url() . '/pricing/calculate';
    $response = wp_remote_post($url, [
        'timeout' => 10,
        'headers' => ['Content-Type' => 'application/json'],
        'body' => wp_json_encode([
            'productId' => $product_id,
            'selectedItemIds' => $selected_item_ids,
            'context' => $context,
        ]),
    ]);

    return printforge_parse_api_response($response, __('Could not verify the PrintForge price.', 'printforge'));
}

function printforge_parse_api_response($response, string $fallback_message)
{
    if (is_wp_error($response)) {
        return new WP_Error('printforge_api_error', $fallback_message);
    }

    $status = (int) wp_remote_retrieve_response_code($response);
    $body = json_decode((string) wp_remote_retrieve_body($response), true);

    if ($status < 200 || $status >= 300 || !is_array($body)) {
        $message = is_array($body) && !empty($body['message']) && is_string($body['message'])
            ? $body['message']
            : $fallback_message;

        return new WP_Error('printforge_api_error', $message);
    }

    return $body;
}

function printforge_sanitize_selected_item_ids($selected_item_ids)
{
    if (!is_array($selected_item_ids)) {
        return new WP_Error('printforge_invalid_options', __('Invalid PrintForge options.', 'printforge'));
    }

    $sanitized = [];

    foreach ($selected_item_ids as $item_id) {
        if (!is_string($item_id) || !preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $item_id)) {
            return new WP_Error('printforge_invalid_options', __('Invalid PrintForge options.', 'printforge'));
        }

        $sanitized[] = $item_id;
    }

    return array_values(array_unique($sanitized));
}

function printforge_sanitize_pricing_context($context)
{
    if (!is_array($context)) {
        return new WP_Error('printforge_invalid_context', __('Invalid PrintForge dimensions.', 'printforge'));
    }

    $width_mm = isset($context['widthMm']) ? (float) $context['widthMm'] : 0.0;
    $height_mm = isset($context['heightMm']) ? (float) $context['heightMm'] : 0.0;
    $quantity = isset($context['quantity']) ? (int) $context['quantity'] : 0;

    if ($width_mm <= 0 || $height_mm <= 0 || $quantity <= 0) {
        return new WP_Error('printforge_invalid_context', __('Invalid PrintForge dimensions.', 'printforge'));
    }

    return [
        'widthMm' => $width_mm,
        'heightMm' => $height_mm,
        'quantity' => $quantity,
    ];
}
