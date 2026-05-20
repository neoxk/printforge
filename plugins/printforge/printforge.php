<?php
/**
 * Plugin Name: PrintForge
 * Description: Embeds the PrintForge options on WooCommerce product pages.
 * Version: 0.1.3
 * Author: PrintForge
 * Text Domain: printforge
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('PRINTFORGE_VERSION')) {
    define('PRINTFORGE_VERSION', '0.1.3');
}

if (!defined('PRINTFORGE_PLUGIN_URL')) {
    define('PRINTFORGE_PLUGIN_URL', plugin_dir_url(__FILE__));
}

if (!defined('PRINTFORGE_OPTIONS_BASE_URL')) {
    define('PRINTFORGE_OPTIONS_BASE_URL', getenv('PRINTFORGE_OPTIONS_BASE_URL') ?: '/pf/options');
}

if (!defined('PRINTFORGE_API_BASE_URL')) {
    define('PRINTFORGE_API_BASE_URL', getenv('PRINTFORGE_API_BASE_URL') ?: 'http://fastify:3000/api');
}

require_once __DIR__ . '/includes/settings.php';
require_once __DIR__ . '/includes/assets.php';
require_once __DIR__ . '/includes/frontend.php';
require_once __DIR__ . '/includes/api.php';
require_once __DIR__ . '/includes/formatting.php';
require_once __DIR__ . '/includes/cart.php';

add_action('wp_enqueue_scripts', 'printforge_enqueue_frontend_assets');
add_action('woocommerce_after_add_to_cart_form', 'printforge_render_options_iframe');
add_filter('woocommerce_add_to_cart_validation', 'printforge_validate_add_to_cart', 10, 5);
add_filter('woocommerce_add_cart_item_data', 'printforge_add_cart_item_data', 10, 4);
add_action('woocommerce_before_calculate_totals', 'printforge_apply_cart_item_price');
add_action('woocommerce_check_cart_items', 'printforge_validate_cart_pricing');
add_action('woocommerce_cart_calculate_fees', 'printforge_add_cart_option_fees');
add_filter('woocommerce_cart_totals_fee_html', 'printforge_format_cart_fee_html', 10, 2);
add_filter('woocommerce_cart_item_price', 'printforge_get_cart_item_price', 10, 3);
add_filter('woocommerce_get_item_data', 'printforge_get_cart_item_data', 10, 2);
add_action('woocommerce_checkout_create_order_line_item', 'printforge_add_order_line_item_meta', 10, 4);
