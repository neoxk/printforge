<?php

if (!defined('ABSPATH')) {
    exit;
}

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

    wp_enqueue_script(
        'printforge-frontend-script',
        PRINTFORGE_PLUGIN_URL . 'assets/js/frontend.js',
        [],
        PRINTFORGE_VERSION,
        true
    );
}
