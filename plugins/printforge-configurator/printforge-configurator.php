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
    define('PRINTFORGE_CONFIGURATOR_VERSION', '0.1.6');
}

if (!defined('PRINTFORGE_CONFIGURATOR_PLUGIN_URL')) {
    define('PRINTFORGE_CONFIGURATOR_PLUGIN_URL', plugin_dir_url(__FILE__));
}

if (!defined('PRINTFORGE_CONFIGURATOR_BASE_URL')) {
    define('PRINTFORGE_CONFIGURATOR_BASE_URL', getenv('PRINTFORGE_CONFIGURATOR_BASE_URL') ?: '/pf/configurator');
}

require_once __DIR__ . '/includes/settings.php';
require_once __DIR__ . '/includes/assets.php';
require_once __DIR__ . '/includes/frontend.php';

add_action('wp_enqueue_scripts', 'printforge_configurator_enqueue_frontend_assets');
add_action('woocommerce_single_product_summary', 'printforge_configurator_render_launcher', 32);
add_filter('render_block', 'printforge_configurator_render_launcher_block_fallback', 10, 2);
