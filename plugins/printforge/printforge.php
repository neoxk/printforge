<?php
/**
 * Plugin Name: PrintForge
 * Description: Embeds the PrintForge options on WooCommerce product pages.
 * Version: 0.1.0
 * Author: PrintForge
 * Text Domain: printforge
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('PRINTFORGE_VERSION')) {
    define('PRINTFORGE_VERSION', '0.1.0');
}

if (!defined('PRINTFORGE_PLUGIN_URL')) {
    define('PRINTFORGE_PLUGIN_URL', plugin_dir_url(__FILE__));
}

if (!defined('PRINTFORGE_OPTIONS_BASE_URL')) {
    define('PRINTFORGE_OPTIONS_BASE_URL', getenv('PRINTFORGE_OPTIONS_BASE_URL') ?: '/pf/options');
}

add_action('wp_enqueue_scripts', 'printforge_enqueue_frontend_assets');
add_action('woocommerce_after_add_to_cart_form', 'printforge_render_options_iframe');

function printforge_enqueue_frontend_assets(): void
{
    if (!function_exists('is_product') || !is_product()) {
        return;
    }

    wp_enqueue_style(
        'printforge-frontend',
        PRINTFORGE_PLUGIN_URL . 'assets/css/frontend.css',
        [],
        PRINTFORGE_VERSION
    );
}

function printforge_render_options_iframe(): void
{
    if (!class_exists('WooCommerce')) {
        return;
    }

    global $product;

    if (!$product instanceof WC_Product) {
        return;
    }

    $woo_product_id = $product->get_id();
    $printforge_product_id = printforge_get_product_id($woo_product_id);

    if (!$printforge_product_id) {
        return;
    }

    $iframe_src = trailingslashit(printforge_get_options_base_url()) . rawurlencode((string) $printforge_product_id);

    printf(
        '<div class="printforge-options"><iframe class="printforge-options__iframe" src="%s" title="%s" loading="lazy"></iframe></div>',
        esc_url($iframe_src),
        esc_attr__('PrintForge product options', 'printforge')
    );
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
