(function () {
    let CONFIGURATOR_OPEN_MESSAGE_TYPE = 'printforge:configurator:open';
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

        if (!isOptionsIframeSource(event.source)) {
            return;
        }

        let launcher = document.querySelector('[data-printforge-configurator]');

        if (launcher) {
            openLauncher(launcher);
        }
    });
})();
