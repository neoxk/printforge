<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_configurator_get_product_id(int $woo_product_id): string
{
    $product_id = get_post_meta($woo_product_id, '_printforge_product_id', true);

    if (is_scalar($product_id) && trim((string) $product_id) !== '') {
        return trim((string) $product_id);
    }

    return (string) $woo_product_id;
}

function printforge_configurator_get_base_url(): string
{
    $base_url = apply_filters('printforge_configurator_base_url', PRINTFORGE_CONFIGURATOR_BASE_URL);

    if (!is_string($base_url) || trim($base_url) === '') {
        return '/pf/configurator';
    }

    return untrailingslashit(trim($base_url));
}
