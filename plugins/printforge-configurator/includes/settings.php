<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_configurator_get_product_id(int $woo_product_id): string
{
    $product_id = get_post_meta($woo_product_id, '_printforge_product_id', true);

    if (is_scalar($product_id) && trim((string) $product_id) !== '') {
        return trim((string) $product_id);
    }

    return (string) $woo_product_id;
}

function printforge_configurator_get_base_url(): string
{
    // Prefer the admin-configured option; fall back to the env-var constant.
    $stored = get_option('printforge_configurator_base_url', '');
    $base_url = is_string($stored) && trim($stored) !== ''
        ? $stored
        : PRINTFORGE_CONFIGURATOR_BASE_URL;

    $base_url = apply_filters('printforge_configurator_base_url', $base_url);

    if (!is_string($base_url) || trim($base_url) === '') {
        return '/pf/configurator';
    }

    return untrailingslashit(trim($base_url));
}

function printforge_configurator_get_options_base_url(): string
{
    $base_url = apply_filters('printforge_options_base_url', PRINTFORGE_OPTIONS_BASE_URL);

    if (!is_string($base_url) || trim($base_url) === '') {
        return '/pf/options';
    }

    return untrailingslashit(trim($base_url));
}

/**
 * The PrintForge backend base URL used for SERVER-TO-SERVER calls (e.g.
 * assigning uploaded designs to a placed order). This must be reachable from
 * the WordPress server itself, which in container setups is NOT the public
 * browser URL — e.g. http://fastify:3000 internally vs http://localhost:5174
 * in the browser. Resolution order: the "Internal API URL" admin setting, then
 * the PRINTFORGE_CONFIGURATOR_API_BASE_URL env/constant, then a sane default.
 *
 * Returned without a trailing slash or "/api" suffix; callers append the full
 * "/api/..." path themselves.
 */
function printforge_configurator_get_api_base_url(): string
{
    $base_url = (string) get_option('printforge_configurator_internal_api_url', '');

    if (trim($base_url) === '' && defined('PRINTFORGE_CONFIGURATOR_API_BASE_URL')) {
        $base_url = (string) PRINTFORGE_CONFIGURATOR_API_BASE_URL;
    }

    $base_url = apply_filters('printforge_configurator_api_base_url', $base_url);

    if (!is_string($base_url) || trim($base_url) === '') {
        return '';
    }

    // Normalize: drop trailing slashes and a trailing "/api" so callers can
    // safely append "/api/storage/...".
    return preg_replace('#/api$#', '', untrailingslashit(trim($base_url)));
}

/**
 * The shared secret copied from the PrintForge admin, used to authenticate the
 * server-to-server call that assigns design files to an order.
 */
function printforge_configurator_get_secret(): string
{
    $secret = (string) get_option('printforge_configurator_secret', '');
    $secret = apply_filters('printforge_configurator_secret', $secret);

    return is_string($secret) ? trim($secret) : '';
}
