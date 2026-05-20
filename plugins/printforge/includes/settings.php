<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_get_product_id(int $woo_product_id): string
{
    $product_id = get_post_meta($woo_product_id, '_printforge_product_id', true);

    if (is_scalar($product_id) && trim((string) $product_id) !== '') {
        return trim((string) $product_id);
    }

    return (string) $woo_product_id;
}

function printforge_get_options_base_url(): string
{
    $base_url = apply_filters('printforge_options_base_url', PRINTFORGE_OPTIONS_BASE_URL);

    if (!is_string($base_url) || trim($base_url) === '') {
        return '/pf/options';
    }

    return untrailingslashit(trim($base_url));
}

function printforge_get_api_base_url(): string
{
    $base_url = apply_filters('printforge_api_base_url', PRINTFORGE_API_BASE_URL);

    if (!is_string($base_url) || trim($base_url) === '') {
        return 'http://fastify:3000/api';
    }

    return untrailingslashit(trim($base_url));
}
