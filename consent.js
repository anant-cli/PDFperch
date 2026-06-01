(function () {
    var CONSENT_KEY = 'cpdf_consent_v2';

    function updateConsent(state) {
        var granted = state === 'granted';
        if (typeof gtag === 'function') {
            gtag('consent', 'update', {
                ad_storage:             granted ? 'granted' : 'denied',
                analytics_storage:      granted ? 'granted' : 'denied',
                ad_personalization:     granted ? 'granted' : 'denied',
                ad_user_data:           granted ? 'granted' : 'denied',
                functionality_storage:  'granted',
                security_storage:       'granted'
            });
        }
        if (granted && typeof gtag === 'function') {
            gtag('set', 'url_passthrough', true);
        }
    }

    function hideBanner() {
        var b = document.getElementById('cpdf-consent-root');
        if (b) b.style.display = 'none';
    }

    function showBanner() {
        var b = document.getElementById('cpdf-consent-root');
        if (b) b.style.display = 'flex';
    }

    function createBanner() {
        if (document.getElementById('cpdf-consent-root')) return;

        var style = document.createElement('style');
        style.textContent = [
            '#cpdf-consent-root{position:fixed;bottom:0;left:0;right:0;background:#0f172a;color:#fff;',
            'font-family:system-ui,-apple-system,sans-serif;z-index:10001;border-top:1px solid #1e293b;',
            'border-radius:12px 12px 0 0;box-shadow:0 -4px 24px rgba(0,0,0,.35);padding:1rem;',
            'display:none;justify-content:center;}',
            '.cpdf-cc{max-width:1100px;width:100%;display:flex;flex-wrap:wrap;align-items:center;',
            'justify-content:space-between;gap:1rem;}',
            '.cpdf-ct{font-size:.9rem;line-height:1.5;flex:2;min-width:220px;}',
            '.cpdf-ct a{color:#93c5fd;text-decoration:underline;text-underline-offset:2px;}',
            '.cpdf-cb{display:flex;gap:.75rem;flex-wrap:wrap;}',
            '.cpdf-btn{padding:.5rem 1.35rem;border-radius:9999px;font-weight:600;cursor:pointer;',
            'font-size:.875rem;border:none;transition:background .2s;}',
            '.cpdf-accept{background:#3b82f6;color:#fff;}',
            '.cpdf-accept:hover{background:#2563eb;}',
            '.cpdf-reject{background:transparent;border:1px solid #64748b;color:#e2e8f0;}',
            '.cpdf-reject:hover{background:#1e293b;border-color:#94a3b8;}',
            '@media(max-width:600px){.cpdf-cc{flex-direction:column;text-align:center;}',
            '.cpdf-cb{justify-content:center;width:100%;}.cpdf-btn{flex:1 1 auto;}}'
        ].join('');
        document.head.appendChild(style);

        var div = document.createElement('div');
        div.id = 'cpdf-consent-root';
        div.setAttribute('role', 'dialog');
        div.setAttribute('aria-label', 'Cookie consent');
        div.innerHTML = '<div class="cpdf-cc">' +
            '<p class="cpdf-ct">We use cookies for analytics and personalised ads to keep ConvertPDF free. ' +
            '<a href="/privacy">Privacy Policy</a></p>' +
            '<div class="cpdf-cb">' +
            '<button class="cpdf-btn cpdf-accept" id="cpdf-accept">Accept all</button>' +
            '<button class="cpdf-btn cpdf-reject" id="cpdf-reject">Reject non-essential</button>' +
            '</div></div>';
        document.body.appendChild(div);

        document.getElementById('cpdf-accept').addEventListener('click', function () {
            localStorage.setItem(CONSENT_KEY, 'granted');
            updateConsent('granted');
            hideBanner();
        });
        document.getElementById('cpdf-reject').addEventListener('click', function () {
            localStorage.setItem(CONSENT_KEY, 'denied');
            updateConsent('denied');
            hideBanner();
        });
    }

    function bindSettingsLink() {
        var link = document.getElementById('cookie-settings-link');
        if (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                localStorage.removeItem(CONSENT_KEY);
                showBanner();
            });
        }
    }

    function init() {
        createBanner();
        bindSettingsLink();
        var stored = localStorage.getItem(CONSENT_KEY);
        if (stored === 'granted') {
            updateConsent('granted');
        } else if (stored === 'denied') {
            updateConsent('denied');
        } else {
            showBanner();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
