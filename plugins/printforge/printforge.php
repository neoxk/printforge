<?php
/**
 * Plugin Name: PrintForge
 * Description: Embeds the PrintForge options on WooCommerce product pages.
 * Version: 0.1.5
 * Author: PrintForge
 * Text Domain: printforge
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('PRINTFORGE_VERSION')) {
    define('PRINTFORGE_VERSION', '0.1.5');
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
add_action('woocommerce_single_product_summary', 'printforge_render_options_iframe', 31);
add_filter('render_block', 'printforge_render_options_iframe_block_fallback', 10, 2);
add_filter('woocommerce_is_purchasable', 'printforge_allow_configured_product_purchase', 10, 2);
add_filter('woocommerce_add_to_cart_validation', 'printforge_validate_add_to_cart', 10, 5);
add_filter('woocommerce_add_cart_item_data', 'printforge_add_cart_item_data', 10, 4);
add_action('woocommerce_before_calculate_totals', 'printforge_apply_cart_item_price');
add_action('woocommerce_check_cart_items', 'printforge_validate_cart_pricing');
add_filter('woocommerce_cart_item_price', 'printforge_get_cart_item_price', 10, 3);
add_filter('woocommerce_get_item_data', 'printforge_get_cart_item_data', 10, 2);
add_action('woocommerce_checkout_create_order_line_item', 'printforge_add_order_line_item_meta', 10, 4);

// [PF-DEBUG] Trace whether WooCommerce even processes the POST as an add-to-cart.
// Remove this whole block when the issue is resolved.
add_action('wp_loaded', function () {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        return;
    }
    printforge_debug_log(sprintf(
        'wp_loaded POST: request_uri=%s add-to-cart=%s post_keys=[%s]',
        $_SERVER['REQUEST_URI'] ?? '',
        isset($_REQUEST['add-to-cart']) ? (string) $_REQUEST['add-to-cart'] : '(none)',
        implode(',', array_keys($_POST))
    ));
}, 5);
add_action('woocommerce_add_to_cart', function ($cart_item_key, $product_id) {
    printforge_debug_log(sprintf('woocommerce_add_to_cart FIRED — item ADDED (product=%s key=%s)', $product_id, $cart_item_key));
}, 10, 2);
add_filter('woocommerce_add_to_cart_validation', function ($passed, $product_id) {
    printforge_debug_log(sprintf('add_to_cart_validation chain reached for product=%s (passed-so-far=%s)', $product_id, $passed ? 'true' : 'false'));
    return $passed;
}, 1, 2);
