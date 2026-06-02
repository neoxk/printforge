<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_enqueue_frontend_assets(): void
{
    $is_printforge_page = (function_exists('is_product') && is_product())
        || (function_exists('is_cart') && is_cart())
        || (function_exists('is_checkout') && is_checkout());

    if (!$is_printforge_page) {
        return;
    }

    wp_enqueue_style(
        'printforge-frontend',
        PRINTFORGE_PLUGIN_URL . 'assets/css/frontend.css',
        [],
        PRINTFORGE_VERSION
    );

    if (function_exists('is_product') && is_product()) {
        wp_enqueue_script(
            'printforge-frontend-script',
            PRINTFORGE_PLUGIN_URL . 'assets/js/frontend.js',
            [],
            PRINTFORGE_VERSION,
            true
        );
    }
}
