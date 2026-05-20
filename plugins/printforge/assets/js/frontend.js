(function () {
    var RESIZE_MESSAGE_TYPE = 'printforge:options:resize';
    var CONFIGURATION_MESSAGE_TYPE = 'printforge:options:change';
    var QUANTITY_MESSAGE_TYPE = 'printforge:quantity:change';
    var CONFIGURATION_FIELD_NAME = 'printforge_configuration';
    var MIN_HEIGHT = 240;

    function findIframe(sourceWindow) {
        var found = null;

        document.querySelectorAll('.printforge-options__iframe').forEach(function (iframe) {
            if (iframe.contentWindow === sourceWindow) {
                found = iframe;
            }
        });

        return found;
    }

    function findCartForm(iframe) {
        var product = iframe.closest('.product');
        var form = product ? product.querySelector('form.cart') : null;

        return form || document.querySelector('form.cart');
    }

    function getFormQuantity(form) {
        var quantityInput = form ? form.querySelector('input.qty[name="quantity"], input[name="quantity"]') : null;
        var quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

        return isFinite(quantity) && quantity > 0 ? quantity : 1;
    }

    function syncQuantityToIframe(iframe) {
        var form = findCartForm(iframe);

        if (!iframe || !iframe.contentWindow || !form) {
            return;
        }

        iframe.contentWindow.postMessage(
            {
                type: QUANTITY_MESSAGE_TYPE,
                quantity: getFormQuantity(form),
            },
            '*'
        );
    }

    function syncQuantityForForm(form) {
        document.querySelectorAll('.printforge-options__iframe').forEach(function (iframe) {
            if (findCartForm(iframe) === form) {
                syncQuantityToIframe(iframe);
            }
        });
    }

    function setConfigurationField(sourceWindow, payload) {
        var iframe = findIframe(sourceWindow);
        var form = iframe ? findCartForm(iframe) : null;

        if (!form) {
            return;
        }

        var field = form.querySelector('input[name="' + CONFIGURATION_FIELD_NAME + '"]');

        if (!field) {
            field = document.createElement('input');
            field.type = 'hidden';
            field.name = CONFIGURATION_FIELD_NAME;
            form.appendChild(field);
        }

        field.value = JSON.stringify(payload);

        if (iframe) {
            syncQuantityToIframe(iframe);
        }
    }

    function resizeIframe(sourceWindow, height) {
        var nextHeight = parseInt(height, 10);
        var iframe = findIframe(sourceWindow);

        if (!iframe || !isFinite(nextHeight) || nextHeight <= 0) {
            return;
        }

        iframe.style.height = Math.max(MIN_HEIGHT, nextHeight) + 'px';
    }

    window.addEventListener('message', function (event) {
        if (!event.data) {
            return;
        }

        if (event.data.type === RESIZE_MESSAGE_TYPE) {
            resizeIframe(event.source, event.data.height);
            return;
        }

        if (event.data.type === CONFIGURATION_MESSAGE_TYPE) {
            setConfigurationField(event.source, event.data);
        }
    });

    document.addEventListener('change', function (event) {
        if (!event.target || !event.target.matches('input.qty[name="quantity"], input[name="quantity"]')) {
            return;
        }

        var form = event.target.closest('form.cart');
        if (form) {
            syncQuantityForForm(form);
        }
    });

    document.addEventListener('input', function (event) {
        if (!event.target || !event.target.matches('input.qty[name="quantity"], input[name="quantity"]')) {
            return;
        }

        var form = event.target.closest('form.cart');
        if (form) {
            syncQuantityForForm(form);
        }
    });

    document.addEventListener('click', function (event) {
        var target = event.target;

        if (!target || !target.closest) {
            return;
        }

        var form = target.closest('form.cart');
        if (!form) {
            return;
        }

        window.setTimeout(function () {
            syncQuantityForForm(form);
        }, 0);
    });

    document.querySelectorAll('.printforge-options__iframe').forEach(function (iframe) {
        iframe.addEventListener('load', function () {
            window.setTimeout(function () {
                syncQuantityToIframe(iframe);
            }, 100);
        });
    });
})();
