<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_configurator_render_launcher(): void
{
    $html = printforge_configurator_get_launcher_html();

    if ($html === '') {
        return;
    }

    $GLOBALS['printforge_configurator_launcher_rendered'] = true;
    echo $html;
}

function printforge_configurator_render_launcher_block_fallback(string $block_content, array $block): string
{
    if (($block['blockName'] ?? '') !== 'woocommerce/product-meta') {
        return $block_content;
    }

    if (!function_exists('is_product') || !is_product()) {
        return $block_content;
    }

    if (!empty($GLOBALS['printforge_configurator_launcher_rendered'])) {
        return $block_content;
    }

    $html = printforge_configurator_get_launcher_html();

    if ($html === '') {
        return $block_content;
    }

    $GLOBALS['printforge_configurator_launcher_rendered'] = true;

    return $block_content . $html;
}

function printforge_configurator_get_launcher_html(): string
{
    if (!class_exists('WooCommerce')) {
        return '';
    }

    $product = printforge_configurator_get_current_product();

    if (!$product instanceof WC_Product) {
        return '';
    }

    $printforge_product_id = printforge_configurator_get_product_id($product->get_id());

    if ($printforge_product_id === '') {
        return '';
    }

    $iframe_src = trailingslashit(printforge_configurator_get_base_url()) . rawurlencode($printforge_product_id);

    $modal_id = 'printforge-configurator-modal-' . $product->get_id();

    return sprintf(
        '<div class="printforge-configurator" data-printforge-configurator><div id="%s" class="printforge-configurator__overlay" role="dialog" aria-modal="true" aria-label="%s" hidden><div class="printforge-configurator__dialog"><div class="printforge-configurator__toolbar"><button class="printforge-configurator__close" type="button" aria-label="%s">%s</button></div><iframe class="printforge-configurator__iframe" data-src="%s" title="%s" loading="lazy"></iframe></div></div></div>',
        esc_attr($modal_id),
        esc_attr__('PrintForge configurator', 'printforge-configurator'),
        esc_attr__('Close configurator', 'printforge-configurator'),
        esc_html__('Close', 'printforge-configurator'),
        esc_url($iframe_src),
        esc_attr__('PrintForge product configurator', 'printforge-configurator')
    );
}

function printforge_configurator_get_current_product()
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
