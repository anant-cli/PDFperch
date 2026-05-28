// Ensure gtag exists if consent.js loads before the primary GA snippet
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// 1. Set default Consent Mode v2 state immediately
gtag('consent', 'default', { ad_storage: 'denied', analytics_storage: 'denied', wait_for_update: 500 });

// 2. Fire immediate update if consent was previously saved
const savedConsent = localStorage.getItem('consent');
if (savedConsent) {
  gtag('consent', 'update', { ad_storage: savedConsent, analytics_storage: savedConsent });
}

function initConsent() {
  if (localStorage.getItem('consent')) return;
  let banner = document.getElementById('cookie-banner');
  
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'cookie-banner';
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#0f172a;color:#ffffff;padding:16px 24px;z-index:9999;border-radius:16px 16px 0 0;font-family:sans-serif;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;box-shadow:0 -4px 20px rgba(0,0,0,0.3);';
    banner.innerHTML = `
      <div style="font-size:14px;max-width:600px;line-height:1.4;">We use cookies to analyze site traffic and serve personalized ads.</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button id="c-rej" style="background:transparent;color:#ffffff;border:1px solid #64748b;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;">Reject non-essential</button>
        <button id="c-acc" style="background:#3b82f6;color:#ffffff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;">Accept all</button>
      </div>
    `;
    document.body.appendChild(banner);

    const handleConsent = (status) => {
      localStorage.setItem('consent', status);
      gtag('consent', 'update', { ad_storage: status, analytics_storage: status });
      banner.style.display = 'none';
    };

    document.getElementById('c-acc').onclick = () => handleConsent('granted');
    document.getElementById('c-rej').onclick = () => handleConsent('denied');
  }
  banner.style.display = 'flex';
}

window.openConsentSettings = () => {
  localStorage.removeItem('consent');
  initConsent();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initConsent);
} else {
  initConsent();
}