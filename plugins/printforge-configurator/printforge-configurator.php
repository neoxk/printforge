<?php
/**
 * Plugin Name: PrintForge Configurator
 * Description: Adds a button on WooCommerce product pages that opens the PrintForge configurator iframe.
 * Version: 0.1.6
 * Author: PrintForge
 * Text Domain: printforge-configurator
 */

if (!defined('ABSPATH')) {
    exit;
}

if (!defined('PRINTFORGE_CONFIGURATOR_VERSION')) {
    define('PRINTFORGE_CONFIGURATOR_VERSION', '0.2.2');
}

if (!defined('PRINTFORGE_CONFIGURATOR_PLUGIN_URL')) {
    define('PRINTFORGE_CONFIGURATOR_PLUGIN_URL', plugin_dir_url(__FILE__));
}

if (!defined('PRINTFORGE_CONFIGURATOR_BASE_URL')) {
    define('PRINTFORGE_CONFIGURATOR_BASE_URL', getenv('PRINTFORGE_CONFIGURATOR_BASE_URL') ?: '/pf/configurator');
}

if (!defined('PRINTFORGE_OPTIONS_BASE_URL')) {
    define('PRINTFORGE_OPTIONS_BASE_URL', getenv('PRINTFORGE_OPTIONS_BASE_URL') ?: '/pf/options');
}

// Server-to-server backend URL (reachable from the WordPress server, not the
// browser). Used to attach uploaded designs to an order at checkout. Falls back
// to the in-cluster service name used by the local Docker setup.
if (!defined('PRINTFORGE_CONFIGURATOR_API_BASE_URL')) {
    define('PRINTFORGE_CONFIGURATOR_API_BASE_URL', getenv('PRINTFORGE_CONFIGURATOR_API_BASE_URL') ?: 'http://fastify:3000');
}


require_once __DIR__ . '/includes/settings.php';
require_once __DIR__ . '/includes/assets.php';
require_once __DIR__ . '/includes/frontend.php';
require_once __DIR__ . '/includes/cart.php';
require_once __DIR__ . '/includes/orders.php';
require_once __DIR__ . '/includes/admin.php';

add_action('wp_enqueue_scripts', 'printforge_configurator_enqueue_frontend_assets');
add_action('woocommerce_single_product_summary', 'printforge_configurator_render_launcher', 32);
add_filter('render_block', 'printforge_configurator_render_launcher_block_fallback', 10, 2);
// Priority 20: run after the printforge options plugin (priority 10) so we can
// extend its cart-item uniqueness key rather than clobber it.
add_filter('woocommerce_add_cart_item_data', 'printforge_configurator_add_cart_item_data', 20, 4);
add_filter('woocommerce_get_item_data', 'printforge_configurator_get_cart_item_data', 20, 2);
add_action('woocommerce_checkout_create_order_line_item', 'printforge_configurator_add_order_line_item_meta', 20, 4);
// Assign uploaded designs to the order right before payment. Classic checkout
// passes the order id; the Store API (block checkout) passes the order object.
add_action('woocommerce_checkout_order_processed', 'printforge_configurator_assign_designs_on_checkout', 20, 1);
add_action('woocommerce_store_api_checkout_order_processed', 'printforge_configurator_assign_designs_on_store_api_checkout', 20, 1);
add_action('admin_menu', 'printforge_configurator_admin_menu');
add_action('admin_init', 'printforge_configurator_admin_init');
