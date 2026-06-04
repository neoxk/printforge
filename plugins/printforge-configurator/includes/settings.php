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
    // Prefer the admin-configured option; fall back to the env-var constant.
    $stored = get_option('printforge_configurator_base_url', '');
    $base_url = is_string($stored) && trim($stored) !== ''
        ? $stored
        : PRINTFORGE_CONFIGURATOR_BASE_URL;

    $base_url = apply_filters('printforge_configurator_base_url', $base_url);

    if (!is_string($base_url) || trim($base_url) === '') {
        return '/pf/configurator';
    }

    return untrailingslashit(trim($base_url));
}

function printforge_configurator_get_options_base_url(): string
{
    $base_url = apply_filters('printforge_options_base_url', PRINTFORGE_OPTIONS_BASE_URL);

    if (!is_string($base_url) || trim($base_url) === '') {
        return '/pf/options';
    }

    return untrailingslashit(trim($base_url));
}
