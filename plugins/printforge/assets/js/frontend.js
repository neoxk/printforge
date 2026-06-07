(function () {
    let RESIZE_MESSAGE_TYPE = 'printforge:options:resize';
    let CONFIGURATION_MESSAGE_TYPE = 'printforge:options:change';
    let DESIGNER_CONFIGURATION_MESSAGE_TYPE = 'printforge:designer:change';
    let QUANTITY_MESSAGE_TYPE = 'printforge:quantity:change';
    let QUANTITY_SET_MESSAGE_TYPE = 'printforge:quantity:set';
    let CONFIGURATION_FIELD_NAME = 'printforge_configuration';
    let DESIGNER_CONFIGURATION_FIELD_NAME = 'printforge_designer_configuration';
    let MIN_HEIGHT = 240;

    function findIframe(sourceWindow) {
        let found = null;

        document.querySelectorAll('.printforge-options__iframe').forEach(function (iframe) {
            if (iframe.contentWindow === sourceWindow) {
                found = iframe;
            }
        });

        return found;
    }

    function getIframeOrigin(iframe) {
        if (!iframe) {
            return null;
        }

        let source = iframe.getAttribute('src');

        if (!source) {
            return null;
        }

        try {
            return new URL(source, globalThis.location.href).origin;
        } catch (error) {
            // Log parsing errors to aid debugging while preserving original behavior
            if (typeof console !== 'undefined' && typeof console.error === 'function') {
                console.error('printforge: failed to parse iframe src URL', error);
            }
            return null;
        }
    }

    // Is the message coming from one of our own embedded iframes (the options
    // app or the configurator/designer overlay)? Verifying the source window
    // identity is both sufficient and more robust than string-matching
    // event.origin against the iframe's src: the two legitimately differ in
    // local dev (localhost vs 127.0.0.1, differing ports, reverse proxies),
    // which would otherwise silently drop the configuration message and leave
    // the required printforge_configuration field empty — blocking add-to-cart.
    function isPrintforgeIframeSource(sourceWindow) {
        let isSource = false;

        document
            .querySelectorAll('.printforge-options__iframe, .printforge-configurator__iframe')
            .forEach(function (iframe) {
                if (iframe.contentWindow === sourceWindow) {
                    isSource = true;
                }
            });

        return isSource;
    }

    function findCartForm(iframe) {
        let product = iframe.closest('.product');
        let form = product ? product.querySelector('form.cart') : null;

        return form || document.querySelector('form.cart');
    }

    function getFormQuantity(form) {
        let quantityInput = form ? form.querySelector('input.qty[name="quantity"], input[name="quantity"]') : null;
        let quantity = quantityInput ? Number.parseInt(quantityInput.value, 10) : 1;

        return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    }

    function syncQuantityToIframe(iframe) {
        let form = findCartForm(iframe);
        let targetOrigin = getIframeOrigin(iframe);

        if (!iframe?.contentWindow || !form || !targetOrigin) {
            return;
        }

        iframe.contentWindow.postMessage(
            {
                type: QUANTITY_MESSAGE_TYPE,
                quantity: getFormQuantity(form),
            },
            targetOrigin
        );
    }

    function syncQuantityForForm(form) {
        document.querySelectorAll('.printforge-options__iframe').forEach(function (iframe) {
            if (findCartForm(iframe) === form) {
                syncQuantityToIframe(iframe);
            }
        });
    }

    function setFormQuantity(sourceWindow, quantity) {
        let iframe = findIframe(sourceWindow);
        let form = iframe ? findCartForm(iframe) : null;
        let quantityInput = form ? form.querySelector('input.qty[name="quantity"], input[name="quantity"]') : null;
        let nextQuantity = Number.parseInt(quantity, 10);

        if (!quantityInput || !Number.isFinite(nextQuantity) || nextQuantity <= 0) {
            return;
        }

        quantityInput.value = String(nextQuantity);
        quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
        quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function setJsonField(sourceWindow, fieldName, payload) {
        let iframe = findIframe(sourceWindow);
        let form = iframe ? findCartForm(iframe) : null;

        if (!form) {
            return;
        }

        let field = form.querySelector('input[name="' + fieldName + '"]');

        if (!field) {
            field = document.createElement('input');
            field.type = 'hidden';
            field.name = fieldName;
            form.appendChild(field);
        }

        field.value = JSON.stringify(payload);

        if (iframe) {
            syncQuantityToIframe(iframe);
        }
    }

    function setConfigurationField(sourceWindow, payload) {
        setJsonField(sourceWindow, CONFIGURATION_FIELD_NAME, payload);
    }

    function setDesignerConfigurationField(sourceWindow, payload) {
        setJsonField(sourceWindow, DESIGNER_CONFIGURATION_FIELD_NAME, payload);
    }

    function resizeIframe(sourceWindow, height) {
        let nextHeight = Number.parseInt(height, 10);
        let iframe = findIframe(sourceWindow);

        if (!iframe || !Number.isFinite(nextHeight) || nextHeight <= 0) {
            return;
        }

        iframe.style.height = Math.max(MIN_HEIGHT, nextHeight) + 'px';
    }

    window.addEventListener('message', function (event) {
        if (!event.data) {
            return;
        }

        if (!isPrintforgeIframeSource(event.source)) {
            return;
        }

        if (event.data.type === RESIZE_MESSAGE_TYPE) {
            resizeIframe(event.source, event.data.height);
            return;
        }

        if (event.data.type === CONFIGURATION_MESSAGE_TYPE) {
            setConfigurationField(event.source, event.data);
            return;
        }

        if (event.data.type === QUANTITY_SET_MESSAGE_TYPE) {
            setFormQuantity(event.source, event.data.quantity);
            return;
        }

        if (event.data.type === DESIGNER_CONFIGURATION_MESSAGE_TYPE) {
            setDesignerConfigurationField(event.source, event.data);
        }
    });

    document.addEventListener('change', function (event) {
        if (!event.target?.matches('input.qty[name="quantity"], input[name="quantity"]')) {
            return;
        }

        let form = event.target.closest('form.cart');
        if (form) {
            syncQuantityForForm(form);
        }
    });

    document.addEventListener('input', function (event) {
        if (!event.target?.matches('input.qty[name="quantity"], input[name="quantity"]')) {
            return;
        }

        let form = event.target.closest('form.cart');
        if (form) {
            syncQuantityForForm(form);
        }
    });

    document.addEventListener('click', function (event) {
        let target = event.target;

        if (!target?.closest) {
            return;
        }

        let form = target.closest('form.cart');
        if (!form) {
            return;
        }

        globalThis.setTimeout(function () {
            syncQuantityForForm(form);
        }, 0);
    });

    document.querySelectorAll('.printforge-options__iframe').forEach(function (iframe) {
        iframe.addEventListener('load', function () {
            globalThis.setTimeout(function () {
                syncQuantityToIframe(iframe);
            }, 100);
        });
    });
})();
