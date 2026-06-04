(function () {
    console.log('[PrintForge] frontend.js loaded on', window.location.href);
    const CONFIGURATOR_OPEN_MESSAGE_TYPE = 'printforge:configurator:open';
    const PREVIEW_REQUEST_TYPE = 'printforge:designer:preview-request';
    const PREVIEW_RESPONSE_TYPE = 'printforge:designer:preview-response';
    const PREVIEW_TIMEOUT_MS = 8000;
    let activeLauncher = null;
    let previousBodyOverflow = '';

    function getParts(launcher) {
        return {
            overlay: launcher.querySelector('.printforge-configurator__overlay'),
            iframe: launcher.querySelector('.printforge-configurator__iframe'),
            closeButton: launcher.querySelector('.printforge-configurator__close'),
        };
    }

    function isOptionsIframeSource(sourceWindow) {
        let isSource = false;

        document.querySelectorAll('.printforge-options__iframe').forEach(function (iframe) {
            if (iframe.contentWindow === sourceWindow) {
                isSource = true;
            }
        });

        return isSource;
    }

    function openLauncher(launcher) {
        let parts = getParts(launcher);

        if (!parts.overlay || !parts.iframe) {
            return;
        }

        if (!parts.iframe.getAttribute('src')) {
            parts.iframe.setAttribute('src', parts.iframe.dataset.src || '');
        }

        activeLauncher = launcher;
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        parts.overlay.hidden = false;

        if (parts.closeButton) {
            parts.closeButton.focus();
        }
    }

    function closeLauncher(launcher) {
        let parts = getParts(launcher);

        if (!parts.overlay) {
            return;
        }

        parts.overlay.hidden = true;
        document.body.style.overflow = previousBodyOverflow;
        activeLauncher = null;
    }

    document.addEventListener('click', function (event) {
        let target = event.target;

        if (!target?.closest) {
            return;
        }

        let closeButton = target.closest('.printforge-configurator__close');

        if (closeButton) {
            let closeLauncherElement = closeButton.closest('[data-printforge-configurator]');

            if (closeLauncherElement) {
                closeLauncher(closeLauncherElement);
            }
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && activeLauncher) {
            closeLauncher(activeLauncher);
        }
    });

    window.addEventListener('message', function (event) {
        if (event.data?.type !== CONFIGURATOR_OPEN_MESSAGE_TYPE) {
            return;
        }

        console.log('[PrintForge] Received configurator:open message', event.data);

        var optionsIframes = document.querySelectorAll('.printforge-options__iframe');
        console.log('[PrintForge] Options iframes found:', optionsIframes.length);
        optionsIframes.forEach(function (iframe, i) {
            console.log('[PrintForge] Options iframe[' + i + '] contentWindow matches source:', iframe.contentWindow === event.source);
        });

        if (!isOptionsIframeSource(event.source)) {
            console.warn('[PrintForge] Source is not a known options iframe — ignoring message');
            return;
        }

        let launcher = document.querySelector('[data-printforge-configurator]');
        console.log('[PrintForge] Launcher found:', !!launcher);

        if (launcher) {
            openLauncher(launcher);
        }
    });

    // ── Preview export on cart submit ─────────────────────────────────────────
    // Intercepts WooCommerce "Add to cart" submits, requests a per-view PNG
    // from the designer iframe, uploads each one to the backend storage API,
    // then re-submits. Falls back to plain submit if the designer was never
    // opened or the iframe doesn't respond within PREVIEW_TIMEOUT_MS.

    function dataUrlToBlob(dataUrl) {
        var parts = dataUrl.split(',');
        var mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/png';
        var binary = atob(parts[1]);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new Blob([bytes], { type: mime });
    }

    // Attach the design sessionId to the cart form so WooCommerce stores it on
    // the cart item (see includes/cart.php). The temp uploads live under this
    // same sessionId, letting the order be linked back to its artwork later.
    function setSessionInput(form, sessionId) {
        var input = form.querySelector('input[name="printforge_session_id"]');
        if (!input) {
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'printforge_session_id';
            form.appendChild(input);
        }
        input.value = sessionId;
    }

    function uploadPreview(apiUrl, sessionId, preview) {
        if (!preview.dataUrl) return Promise.resolve();
        var blob = dataUrlToBlob(preview.dataUrl);
        var body = new FormData();
        body.append('file', blob, 'view-' + preview.viewId + '.png');
        var url = apiUrl + '/api/storage/temp/' + encodeURIComponent(sessionId);
        console.log('[PrintForge] uploading preview view=' + preview.viewId + ' ->', url);
        return fetch(url, { method: 'POST', body: body })
            .then(function (res) {
                if (!res.ok) {
                    console.error('[PrintForge] upload failed', res.status, res.statusText, 'view=' + preview.viewId);
                } else {
                    console.log('[PrintForge] upload ok', res.status, 'view=' + preview.viewId);
                }
                return res;
            })
            .catch(function (err) {
                console.error('[PrintForge] upload network error view=' + preview.viewId, err);
                throw err;
            });
    }

    document.addEventListener('submit', function (event) {
        var form = event.target;
        if (!form || typeof form.matches !== 'function' || !form.matches('form.cart')) {
            return;
        }

        // Prevents re-entry when we call form.submit() after uploads complete.
        if (form._printforgePreviewDone) {
            return;
        }

        console.log('[PrintForge] cart submit intercepted — checking for a design to upload');

        var launcher = document.querySelector('[data-printforge-configurator]');
        if (!launcher) { console.warn('[PrintForge] no configurator launcher on page — skipping upload'); return; }

        var iframe = launcher.querySelector('.printforge-configurator__iframe');
        // If the designer was never opened its src was never set — nothing to export.
        if (!iframe || !iframe.getAttribute('src') || !iframe.contentWindow) {
            console.warn('[PrintForge] designer iframe was never opened (no src) — nothing to export');
            return;
        }

        var apiUrl = (window.printforgeConfigurator || {}).apiUrl || '';
        if (!apiUrl) {
            console.error('[PrintForge] printforge_public_api_url is not configured — set it in WP admin (PrintForge Configurator settings)');
            return;
        }
        // Normalize so the base may be given with or without a trailing slash or
        // a trailing "/api" — the storage path below already includes "/api".
        apiUrl = apiUrl.replace(/\/+$/, '').replace(/\/api$/, '');

        var iframeSrc = iframe.getAttribute('src') || '';
        var sessionId = '';
        try {
            sessionId = new URL(iframeSrc, window.location.href).searchParams.get('sessionId') || '';
        } catch (_) {}
        if (!sessionId) { console.warn('[PrintForge] no sessionId in designer iframe src — skipping upload'); return; }

        console.log('[PrintForge] exporting designs for sessionId=' + sessionId + ' to ' + apiUrl);

        // Reference the design session on the cart item, even if the preview
        // upload below fails or times out.
        setSessionInput(form, sessionId);

        event.preventDefault();

        var requestId = Math.random().toString(36).slice(2);
        var finished = false;
        var timeoutId;

        function finish(previews) {
            if (finished) return;
            finished = true;
            clearTimeout(timeoutId);
            window.removeEventListener('message', onMessage);

            if (previews === null) {
                console.warn('[PrintForge] no preview-response from designer within ' + PREVIEW_TIMEOUT_MS + 'ms — submitting cart without artwork upload');
            }

            var uploads = (previews || [])
                .filter(function (p) { return p.dataUrl; })
                .map(function (p) { return uploadPreview(apiUrl, sessionId, p); });

            console.log('[PrintForge] uploading ' + uploads.length + ' design preview(s)');

            Promise.all(uploads).catch(function () {
                // Upload errors are non-fatal — let the order proceed.
            }).then(function () {
                console.log('[PrintForge] upload phase complete — submitting cart form');
                form._printforgePreviewDone = true;
                form.submit();
            });
        }

        function onMessage(event) {
            if (!event.data || event.data.type !== PREVIEW_RESPONSE_TYPE) return;
            if (event.data.requestId !== requestId) return;
            if (event.source !== iframe.contentWindow) return;
            finish(event.data.previews || null);
        }

        window.addEventListener('message', onMessage);
        timeoutId = setTimeout(function () { finish(null); }, PREVIEW_TIMEOUT_MS);

        iframe.contentWindow.postMessage(
            { type: PREVIEW_REQUEST_TYPE, requestId: requestId },
            '*'
        );
    }, true); // capture phase — runs before WooCommerce's own submit handlers
})();
