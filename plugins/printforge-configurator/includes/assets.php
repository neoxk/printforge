<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_configurator_enqueue_frontend_assets(): void
{
    if (!function_exists('is_product') || !is_product()) {
        return;
    }

    wp_enqueue_style(
        'printforge-configurator-frontend',
        PRINTFORGE_CONFIGURATOR_PLUGIN_URL . 'assets/css/frontend.css',
        [],
        PRINTFORGE_CONFIGURATOR_VERSION
    );

    wp_enqueue_script(
        'printforge-configurator-frontend',
        PRINTFORGE_CONFIGURATOR_PLUGIN_URL . 'assets/js/frontend.js',
        [],
        PRINTFORGE_CONFIGURATOR_VERSION,
        true
    );

    wp_localize_script('printforge-configurator-frontend', 'printforgeConfigurator', [
        'apiUrl' => untrailingslashit(get_option('printforge_public_api_url', '')),
    ]);
}
