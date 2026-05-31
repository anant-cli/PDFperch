// consent.js - GDPR Cookie Consent Banner with Google Consent Mode v2
(function() {
        // ---------- Helper: Update Google Consent ----------
    function updateGoogleConsent(state) {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                ad_storage: state,
                analytics_storage: state,
                ad_personalization: state,
                ad_user_data: state
            });
        }
    }

    // ---------- DOM Elements & Banner Management ----------
    let bannerElement = null;

    function hideBanner() {
        if (bannerElement) bannerElement.style.display = 'none';
    }

    function showBanner() {
        if (bannerElement) bannerElement.style.display = 'flex';
    }

    // ---------- Create Banner HTML & CSS (injected once) ----------
    function createBanner() {
        if (document.getElementById('consent-banner-root')) return;

        const style = document.createElement('style');
        style.textContent = `
            #consent-banner-root {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: #0f172a;
                color: white;
                font-family: system-ui, -apple-system, sans-serif;
                z-index: 9999;
                border-radius: 12px 12px 0 0;
                box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
                padding: 1rem;
                display: none;
                justify-content: center;
                backdrop-filter: blur(2px);
                border-top: 1px solid #1e293b;
            }
            .consent-content {
                max-width: 1200px;
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            .consent-text {
                font-size: 0.9rem;
                line-height: 1.4;
                flex: 2;
                min-width: 200px;
            }
            .consent-text a {
                color: #93c5fd;
                text-decoration: underline;
                text-underline-offset: 2px;
            }
            .consent-buttons {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
            }
            .btn-accept {
                background: #3b82f6;
                border: none;
                color: white;
                padding: 0.5rem 1.25rem;
                border-radius: 9999px;
                font-weight: 500;
                cursor: pointer;
                transition: 0.2s;
                font-size: 0.85rem;
            }
            .btn-accept:hover { background: #2563eb; }
            .btn-reject {
                background: transparent;
                border: 1px solid #64748b;
                color: #e2e8f0;
                padding: 0.5rem 1.25rem;
                border-radius: 9999px;
                font-weight: 500;
                cursor: pointer;
                transition: 0.2s;
                font-size: 0.85rem;
            }
            .btn-reject:hover { background: #1e293b; border-color: #94a3b8; }
            @media (max-width: 640px) {
                .consent-content { flex-direction: column; text-align: center; }
                .consent-buttons { justify-content: center; }
            }
        `;
        document.head.appendChild(style);

        const bannerDiv = document.createElement('div');
        bannerDiv.id = 'consent-banner-root';
        bannerDiv.innerHTML = `
            <div class="consent-content">
                <div class="consent-text">
                    We value your privacy. This site uses cookies for analytics and personalized ads.
                    Choose "Accept all" or "Reject non-essential" to continue.
                    <a href="/privacy.html">Privacy Policy</a>
                </div>
                <div class="consent-buttons">
                    <button class="btn-accept" id="consent-accept-btn">Accept all</button>
                    <button class="btn-reject" id="consent-reject-btn">Reject non-essential</button>
                </div>
            </div>
        `;
        document.body.appendChild(bannerDiv);
        bannerElement = bannerDiv;

        // Attach button events
        document.getElementById('consent-accept-btn').addEventListener('click', () => {
            localStorage.setItem('consent', 'granted');
            updateGoogleConsent('granted');
            hideBanner();
        });
        document.getElementById('consent-reject-btn').addEventListener('click', () => {
            localStorage.setItem('consent', 'denied');
            updateGoogleConsent('denied');
            hideBanner();
        });
    }

    // ---------- Handle Footer Link: "Cookie Settings" ----------
    function bindFooterLink() {
        const settingsLink = document.getElementById('cookie-settings-link');
        if (settingsLink) {
            settingsLink.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('consent');
                showBanner();
            });
        }
    }

    // ---------- Initialize on Page Load ----------
    function init() {
        createBanner();
        bindFooterLink();

        const existingConsent = localStorage.getItem('consent');
        if (existingConsent === 'granted') {
            updateGoogleConsent('granted');
            hideBanner();
        } else if (existingConsent === 'denied') {
            updateGoogleConsent('denied');
            hideBanner();
        } else {
            // No consent stored → show banner
            showBanner();
        }
    }

    // Run after DOM is ready to ensure footer link exists
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
