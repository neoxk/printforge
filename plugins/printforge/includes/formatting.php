<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_get_verified_option_labels(array $printforge): array
{
    $display_options = $printforge['displayOptions'] ?? [];

    if (!is_array($display_options)) {
        return [];
    }

    $options = [];

    foreach ($display_options as $option) {
        if (
            !is_array($option)
            || empty($option['container'])
            || !is_string($option['container'])
            || empty($option['items'])
        ) {
            continue;
        }

        if (is_string($option['items'])) {
            $options[] = [
                'container' => $option['container'],
                'items' => $option['items'],
            ];
            continue;
        }

        if (!is_array($option['items'])) {
            continue;
        }

        $item_labels = [];

        foreach ($option['items'] as $item) {
            if (
                !is_array($item)
                || empty($item['id'])
                || !is_string($item['id'])
                || empty($item['name'])
                || !is_string($item['name'])
            ) {
                continue;
            }

            $item_labels[] = $item['name'];
        }

        if ($item_labels !== []) {
            $options[] = [
                'container' => $option['container'],
                'items' => implode(', ', $item_labels),
            ];
        }
    }

    return $options;
}

function printforge_get_verified_option_rows(array $printforge): array
{
    $display_options = $printforge['displayOptions'] ?? [];

    if (!is_array($display_options)) {
        return [];
    }

    $context = $printforge['configuration']['context'] ?? [];
    $dimensions = is_array($context) ? printforge_format_dimensions($context) : '';
    $pricing_by_item_id = printforge_get_option_pricing_by_item_id($printforge['pricing']['breakdown'] ?? []);
    $rows = [];

    foreach ($display_options as $option) {
        if (
            !is_array($option)
            || empty($option['container'])
            || !is_string($option['container'])
            || empty($option['items'])
            || !is_array($option['items'])
        ) {
            continue;
        }

        foreach ($option['items'] as $item) {
            if (
                !is_array($item)
                || empty($item['id'])
                || !is_string($item['id'])
                || empty($item['name'])
                || !is_string($item['name'])
            ) {
                continue;
            }

            $pricing = $pricing_by_item_id[$item['id']] ?? [
                'cost' => 0.0,
                'calculationBasis' => '',
            ];
            $rows[] = [
                'container' => $option['container'],
                'item' => $item['name'],
                'cost' => (float) $pricing['cost'],
                'calculationBasis' => (string) $pricing['calculationBasis'],
                'dimensions' => '',
            ];
        }
    }

    return $rows;
}

function printforge_get_selected_option_labels(array $config, array $selected_item_ids): array
{
    $containers = $config['containers'] ?? [];

    if (!is_array($containers)) {
        return [];
    }

    $selected_lookup = array_fill_keys($selected_item_ids, true);
    $options = [];

    foreach ($containers as $container) {
        if (
            !is_array($container)
            || !empty($container['isHidden'])
            || (($container['containerType'] ?? '') === 'AUTO_APPLIED')
            || empty($container['name'])
            || !is_string($container['name'])
            || empty($container['items'])
            || !is_array($container['items'])
        ) {
            continue;
        }

        $items = [];

        foreach ($container['items'] as $item) {
            if (
                is_array($item)
                && !empty($item['id'])
                && is_string($item['id'])
                && isset($selected_lookup[$item['id']])
                && !empty($item['name'])
                && is_string($item['name'])
            ) {
                $items[] = [
                    'id' => $item['id'],
                    'name' => $item['name'],
                ];
            }
        }

        if ($items !== []) {
            $options[] = [
                'container' => $container['name'],
                'items' => $items,
            ];
        }
    }

    return $options;
}

function printforge_get_option_pricing_by_item_id($breakdown): array
{
    if (!is_array($breakdown)) {
        return [];
    }

    $pricing = [];

    foreach ($breakdown as $line_item) {
        if (
            is_array($line_item)
            && !empty($line_item['itemId'])
            && is_string($line_item['itemId'])
            && isset($line_item['cost'])
            && is_numeric($line_item['cost'])
        ) {
            $pricing[$line_item['itemId']] = [
                'cost' => (float) $line_item['cost'],
                'calculationBasis' => is_string($line_item['calculationBasis'] ?? null)
                    ? $line_item['calculationBasis']
                    : '',
            ];
        }
    }

    return $pricing;
}

function printforge_format_plain_price(float $cost, string $calculation_basis): string
{
    if ($calculation_basis === 'FREE') {
        return __('FREE', 'printforge');
    }

    return html_entity_decode(
        wp_strip_all_tags(wc_price($cost)),
        ENT_QUOTES,
        get_bloginfo('charset') ?: 'UTF-8'
    );
}

function printforge_format_dimensions(array $context): string
{
    $width_mm = isset($context['widthMm']) ? (float) $context['widthMm'] : 0.0;
    $height_mm = isset($context['heightMm']) ? (float) $context['heightMm'] : 0.0;

    return sprintf('%s x %s mm', wc_format_decimal($width_mm), wc_format_decimal($height_mm));
}
