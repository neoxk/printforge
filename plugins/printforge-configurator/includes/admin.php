<?php

if (!defined('ABSPATH')) {
    exit;
}

function printforge_configurator_admin_menu(): void
{
    add_options_page(
        __('PrintForge Configurator', 'printforge-configurator'),
        __('PrintForge Configurator', 'printforge-configurator'),
        'manage_options',
        'printforge-configurator',
        'printforge_configurator_render_settings_page'
    );
}

function printforge_configurator_admin_init(): void
{
    register_setting('printforge_configurator_settings', 'printforge_public_api_url', [
        'type'              => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default'           => '',
    ]);

    register_setting('printforge_configurator_settings', 'printforge_configurator_base_url', [
        'type'              => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default'           => '',
    ]);

    register_setting('printforge_configurator_settings', 'printforge_configurator_internal_api_url', [
        'type'              => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default'           => '',
    ]);

    register_setting('printforge_configurator_settings', 'printforge_configurator_secret', [
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => '',
    ]);

    add_settings_section(
        'printforge_configurator_app',
        __('Configurator App', 'printforge-configurator'),
        null,
        'printforge-configurator'
    );

    add_settings_field(
        'printforge_configurator_base_url',
        __('Designer Base URL', 'printforge-configurator'),
        'printforge_configurator_render_base_url_field',
        'printforge-configurator',
        'printforge_configurator_app',
        ['label_for' => 'printforge_configurator_base_url']
    );

    add_settings_section(
        'printforge_configurator_endpoints',
        __('Backend Endpoints', 'printforge-configurator'),
        null,
        'printforge-configurator'
    );

    add_settings_field(
        'printforge_public_api_url',
        __('Public API URL', 'printforge-configurator'),
        'printforge_configurator_render_public_api_url_field',
        'printforge-configurator',
        'printforge_configurator_endpoints',
        ['label_for' => 'printforge_public_api_url']
    );

    add_settings_field(
        'printforge_configurator_internal_api_url',
        __('Internal API URL', 'printforge-configurator'),
        'printforge_configurator_render_internal_api_url_field',
        'printforge-configurator',
        'printforge_configurator_endpoints',
        ['label_for' => 'printforge_configurator_internal_api_url']
    );

    add_settings_field(
        'printforge_configurator_secret',
        __('Plugin secret', 'printforge-configurator'),
        'printforge_configurator_render_secret_field',
        'printforge-configurator',
        'printforge_configurator_endpoints',
        ['label_for' => 'printforge_configurator_secret']
    );
}

function printforge_configurator_render_base_url_field(): void
{
    $value = get_option('printforge_configurator_base_url', '');
    echo '<input type="url" id="printforge_configurator_base_url" name="printforge_configurator_base_url"'
        . ' value="' . esc_attr($value) . '"'
        . ' class="regular-text" placeholder="https://app.example.com/pf/configurator" />';
    echo '<p class="description">'
        . esc_html__('Where the browser loads the design canvas (the /pf/configurator route). Leave blank to use the PRINTFORGE_CONFIGURATOR_BASE_URL env var or the /pf/configurator default.', 'printforge-configurator')
        . '</p>';
}

function printforge_configurator_render_public_api_url_field(): void
{
    $value = get_option('printforge_public_api_url', '');
    echo '<input type="url" id="printforge_public_api_url" name="printforge_public_api_url"'
        . ' value="' . esc_attr($value) . '"'
        . ' class="regular-text" placeholder="https://api.example.com" />';
    echo '<p class="description">'
        . esc_html__('The publicly accessible PrintForge backend URL. Used by the browser to upload design previews at checkout.', 'printforge-configurator')
        . '</p>';
}

function printforge_configurator_render_internal_api_url_field(): void
{
    $value = get_option('printforge_configurator_internal_api_url', '');
    $default = defined('PRINTFORGE_CONFIGURATOR_API_BASE_URL') ? PRINTFORGE_CONFIGURATOR_API_BASE_URL : '';
    echo '<input type="url" id="printforge_configurator_internal_api_url" name="printforge_configurator_internal_api_url"'
        . ' value="' . esc_attr($value) . '"'
        . ' class="regular-text" placeholder="' . esc_attr($default ?: 'http://fastify:3000') . '" />';
    echo '<p class="description">'
        . esc_html__('The backend URL reachable from the WordPress server (NOT the browser). Used server-side to attach uploaded designs to an order at checkout. In Docker this is the internal service name, e.g. http://fastify:3000 — not the public localhost URL. Leave blank to use the PRINTFORGE_CONFIGURATOR_API_BASE_URL env var.', 'printforge-configurator')
        . '</p>';
}

function printforge_configurator_render_secret_field(): void
{
    $value = get_option('printforge_configurator_secret', '');
    echo '<input type="password" id="printforge_configurator_secret" name="printforge_configurator_secret"'
        . ' value="' . esc_attr($value) . '"'
        . ' class="regular-text" autocomplete="off" />';
    echo '<p class="description">'
        . esc_html__('Copy this from the PrintForge admin (Settings → Plugin secret). Used to authenticate this store when attaching uploaded designs to a placed order.', 'printforge-configurator')
        . '</p>';
}

function printforge_configurator_render_settings_page(): void
{
    if (!current_user_can('manage_options')) {
        return;
    }
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('printforge_configurator_settings');
            do_settings_sections('printforge-configurator');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}
