<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_render_options_iframe(): void
{
    $html = printforge_get_options_iframe_html();

    if ($html === '') {
        return;
    }

    $GLOBALS['printforge_options_iframe_rendered'] = true;
    echo $html;
}

function printforge_render_options_iframe_block_fallback(string $block_content, array $block): string
{
    if (($block['blockName'] ?? '') !== 'woocommerce/product-meta') {
        return $block_content;
    }

    if (!function_exists('is_product') || !is_product()) {
        return $block_content;
    }

    if (!empty($GLOBALS['printforge_options_iframe_rendered'])) {
        return $block_content;
    }

    $html = printforge_get_options_iframe_html();

    if ($html === '') {
        return $block_content;
    }

    $GLOBALS['printforge_options_iframe_rendered'] = true;

    return $html . $block_content;
}

function printforge_get_options_iframe_html(): string
{
    if (!class_exists('WooCommerce')) {
        return '';
    }

    $product = printforge_get_current_product();

    if (!$product instanceof WC_Product) {
        return '';
    }

    $woo_product_id = $product->get_id();
    $printforge_product_id = printforge_get_product_id($woo_product_id);

    if (!$printforge_product_id) {
        return '';
    }

    $iframe_src = add_query_arg(
        ['basePrice' => printforge_normalize_woo_price($product->get_price())],
        trailingslashit(printforge_get_options_base_url()) . rawurlencode((string) $printforge_product_id)
    );

    return sprintf(
        '<div class="printforge-options"><iframe class="printforge-options__iframe" src="%s" title="%s" loading="lazy" scrolling="no"></iframe></div>',
        esc_url($iframe_src),
        esc_attr__('PrintForge product options', 'printforge')
    );
}

function printforge_get_current_product()
{
    global $product;

    if ($product instanceof WC_Product) {
        return $product;
    }

    $queried_object = get_queried_object();

    if ($queried_object instanceof WP_Post && $queried_object->post_type === 'product') {
        $queried_product = wc_get_product($queried_object->ID);

        if ($queried_product instanceof WC_Product) {
            return $queried_product;
        }
    }

    return null;
}
