<?php

if (!defined('ABSPATH')) {
    exit;
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

    $iframe_src = add_query_arg(
        ['basePrice' => $product->get_price()],
        trailingslashit(printforge_get_options_base_url()) . rawurlencode((string) $printforge_product_id)
    );

    printf(
        '<div class="printforge-options"><iframe class="printforge-options__iframe" src="%s" title="%s" loading="lazy" scrolling="no"></iframe></div>',
        esc_url($iframe_src),
        esc_attr__('PrintForge product options', 'printforge')
    );
}
