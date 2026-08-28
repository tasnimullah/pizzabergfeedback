/**
 * Pizzaberg — Feedback Landing Page
 * main.js  |  Vanilla JS, no dependencies
 *
 * Sections:
 *  1. Business Config (multi-tenant)
 *  2. Modal helpers
 *  3. Satisfied flow (Google Review redirect)
 *  4. Feedback form (Not Satisfied)
 *  5. Promo / join form
 *  6. Keyboard & overlay-click listeners
 *  7. Init
 */

'use strict';

/* ─────────────────────────────────────────────────────────
   1. BUSINESS CONFIG
   In production replace this map with an API / database call.
   Pass ?business=<slug> in the URL to load a specific config.
   ───────────────────────────────────────────────────────── */
const BUSINESS_CONFIGS = {
  'pizzaberg': {
    name: 'Pizzaberg',
    tagline: 'Thank you for dining with us.',
    reviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJjb4WP-fAVTcRL8j4RRSSFM8',
    whatsapp: '',          // e.g. '15125550198'
    email: '',          // e.g. 'hello@saltandembar.com'
    address: 'Avenue Road Section:2 , Block: A, Avenue:1 , House: 12/1, Dhaka 1216',
    phone: '01908327868',
    hours: 'Mon–Thu 4–10 PM · Fri–Sat 4–11 PM · Sun 4–9 PM',
  },
  // Add more business slugs here as needed
};

/**
 * Read ?business= from the query string and apply the matching
 * config to the page.  Falls back gracefully if no match found.
 */
function applyBusinessConfig() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('business') || 'pizzaberg';
  const config = BUSINESS_CONFIGS[slug];

  if (!config) {
    console.warn(`[Pizzaberg] No config found for business slug: "${slug}"`);
    return;
  }

  // Expose config globally so other functions can reference it
  window.SE_CONFIG = config;
  console.log('[Pizzaberg] Loaded config for:', config.name);
}

/* ─────────────────────────────────────────────────────────
   2. MODAL HELPERS
   ───────────────────────────────────────────────────────── */

/**
 * Open a named modal overlay.
 * @param {string} modalId — id of the .modal-overlay element
 */
function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Move focus to the modal for accessibility
  const firstFocusable = el.querySelector('button, input, textarea, select, a[href]');
  if (firstFocusable) firstFocusable.focus();
}

/**
 * Close a named modal overlay.
 * @param {string} modalId — id of the .modal-overlay element
 */
function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
}

/** Close every open modal (used by ESC key handler). */
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => {
    m.classList.remove('open');
  });
  document.body.style.overflow = '';
}

/* ─────────────────────────────────────────────────────────
   3. SATISFIED FLOW
   ───────────────────────────────────────────────────────── */

/**
 * Extract Place ID from a Google review URL.
 * @param {string} url — e.g. "https://search.google.com/local/writereview?placeid=XYZ"
 * @returns {string|null}
 */
function extractPlaceId(url) {
  try {
    const u = new URL(url);
    return u.searchParams.get('placeid') || u.searchParams.get('place_id') || null;
  } catch (e) {
    return null;
  }
}

/**
 * Called when the user taps "Satisfied".
 * Routes the user to the Google Review page for the business.
 *
 * Platform behavior:
 *
 *   ANDROID (Maps installed):
 *     Opens the review composer directly inside the Google Maps app.
 *     The user is already signed in on Maps, so no login prompt.
 *     Uses /local/writereview/mobile — the path Maps registers as a
 *     verified Android deep link — wrapped in an intent:// URL.
 *     CRITICAL: No `package=` in the intent. That's what prevents
 *     the Play Store fallback. Without it, Android simply tries to
 *     resolve the HTTPS URL through verified links. If Maps handles
 *     it → Maps opens. If not → browser_fallback_url kicks in.
 *
 *   ANDROID (Maps NOT installed / can't resolve):
 *     Falls through to S.browser_fallback_url → the standard browser
 *     review page. Never the Play Store.
 *
 *   DESKTOP:
 *     Opens the standard review URL in the browser. Google shows the
 *     review pop-up (star rating, comment box) directly on the page.
 *
 *   iOS:
 *     Opens the standard review URL in Safari/Chrome.
 */
function handleSatisfied() {
  const config = window.SE_CONFIG || {};
  const fallbackUrl = 'https://search.google.com/local/writereview?placeid=ChIJjb4WP-fAVTcRL8j4RRSSFM8';
  const reviewUrl = config.reviewUrl || fallbackUrl;
  const placeId = extractPlaceId(reviewUrl);
  const ua = navigator.userAgent || '';

  if (/android/i.test(ua) && placeId) {
    // ── ANDROID ──────────────────────────────────────────
    // Target the /mobile path — Maps' verified deep link for
    // the review composer. Omit `package=` so it can NEVER
    // fall through to the Play Store.
    const browserFallback = encodeURIComponent(reviewUrl);
    const intentUrl =
      'intent://search.google.com/local/writereview/mobile?placeid=' + placeId +
      '#Intent;scheme=https;' +
      'S.browser_fallback_url=' + browserFallback + ';end';

    // Use a temporary <a> for reliable intent dispatch on Chrome Android
    const a = document.createElement('a');
    a.href = intentUrl;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); }, 200);

  } else {
    // ── DESKTOP & iOS ────────────────────────────────────
    // The standard review URL opens the pop-up review form
    // directly in the browser (as shown in the screenshot).
    // .replace() removes the feedback page from history so
    // pressing Back won't loop back here.
    window.location.replace(reviewUrl);
  }
}

/* ─────────────────────────────────────────────────────────
   4. FEEDBACK FORM (Not Satisfied)
   ───────────────────────────────────────────────────────── */

/** Open the "Not Satisfied" private feedback modal. */
function openFeedbackModal() {
  openModal('feedbackModal');
}

/** Toggle a category chip's selected state. */
function toggleChip(el) {
  el.classList.toggle('selected');
}

/**
 * Collect form data, POST to backend (or log in demo), then show success.
 * Replace the console.log with a real fetch() call in production.
 */
function submitFeedback() {
  const categories = [...document.querySelectorAll('#categoryChips .chip.selected')]
    .map(c => c.textContent.trim());
  const comment = document.getElementById('feedbackComment').value.trim();
  const contact = document.getElementById('feedbackContact').value.trim();
  const config = window.SE_CONFIG || {};

  const payload = {
    business: config.name || 'Pizzaberg',
    categories,
    comment,
    contact,
    timestamp: new Date().toISOString(),
  };

  // ── Paste your Google Apps Script Webhook URL here ──
  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwRCjMh9GORFU_Y-BkAWKLE3yNnEu7S172axMN8wPXvmwBEI_zwugXoWudRah-2WEga/exec';

  if (!GOOGLE_SHEET_URL || GOOGLE_SHEET_URL === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
    // Fallback: URL not configured yet
    console.log('[Pizzaberg] Form Data (Not saved yet):', payload);
    document.getElementById('feedbackFormView').style.display = 'none';
    document.getElementById('feedbackSuccess').classList.add('show');
    return;
  }

  // Disable the button to prevent multiple clicks
  const submitBtn = document.querySelector('#feedbackFormView .btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  // Send data to Google Sheets via GET (required for Google Apps Script + no-cors)
  const url = GOOGLE_SHEET_URL + '?data=' + encodeURIComponent(JSON.stringify(payload));
  fetch(url, { method: 'GET', mode: 'no-cors' })
    .then(() => {
      document.getElementById('feedbackFormView').style.display = 'none';
      document.getElementById('feedbackSuccess').classList.add('show');
    })
    .catch(err => {
      console.error('Feedback submit error:', err);
      alert('Something went wrong sending your feedback. Please try again.');
    })
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
}

/** Reset the feedback form fields and restore the form view. */
function resetFeedbackForm() {
  document.querySelectorAll('#categoryChips .chip').forEach(c => c.classList.remove('selected'));
  document.getElementById('feedbackComment').value = '';
  document.getElementById('feedbackContact').value = '';
  document.getElementById('feedbackFormView').style.display = '';
  document.getElementById('feedbackSuccess').classList.remove('show');
}

/* ─────────────────────────────────────────────────────────
   5. PROMO / JOIN FORM (WhatsApp & Email)
   ───────────────────────────────────────────────────────── */

/** Open the promo sign-up modal. */
function openPromoModal() {
  openModal('promoModal');
}

/**
 * Validate and submit the promo sign-up.
 * Replace the console.log with a real API call in production.
 */
function submitPromo() {
  const name = document.getElementById('promoName').value.trim();
  const birthDate = document.getElementById('promoBirthDate').value;
  const mobileNumber = document.getElementById('promoMobile').value.trim();

  const errorEl = document.getElementById('promoError');
  if (errorEl) errorEl.style.display = 'none';

  if (!name) {
    showFieldError('Please enter your name.');
    return;
  }
  if (!birthDate) {
    showFieldError('Please select your birth date.');
    return;
  }
  if (!mobileNumber) {
    showFieldError('Please enter a valid mobile number.');
    return;
  }

  const config = window.SE_CONFIG || {};
  const payload = {
    formType: 'birthday',
    business: config.name || 'Pizzaberg',
    name,
    birthDate,
    mobileNumber,
    timestamp: new Date().toISOString(),
  };

  const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwRCjMh9GORFU_Y-BkAWKLE3yNnEu7S172axMN8wPXvmwBEI_zwugXoWudRah-2WEga/exec';

  const submitBtn = document.querySelector('#promoFormView .btn-submit');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;

  const url = GOOGLE_SHEET_URL + '?data=' + encodeURIComponent(JSON.stringify(payload));
  fetch(url, { method: 'GET', mode: 'no-cors' })
    .then(() => {
      document.getElementById('promoFormView').style.display = 'none';
      document.getElementById('promoSuccess').classList.add('show');
    })
    .catch(err => {
      console.error('Promo submit error:', err);
      alert('Something went wrong. Please try again.');
    })
    .finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
}

/**
 * Display an inline error message inside the promo modal.
 * @param {string} message
 */
function showFieldError(message) {
  let errEl = document.getElementById('promoError');
  if (!errEl) {
    errEl = document.createElement('p');
    errEl.id = 'promoError';
    errEl.style.cssText = 'color:#B85C3A;font-size:0.85rem;margin:-8px 0 8px;text-align:center;';
    const submitBtn = document.querySelector('#promoFormView .btn-submit');
    submitBtn.parentNode.insertBefore(errEl, submitBtn);
  }
  errEl.textContent = message;
  errEl.style.display = 'block';
}

/* ─────────────────────────────────────────────────────────
   6. GLOBAL EVENT LISTENERS
   ───────────────────────────────────────────────────────── */

/** Dismiss any overlay when clicking its dark background. */
function initOverlayClickDismiss() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

/** ESC key closes the topmost open modal. */
function initEscapeKey() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });
}

/* ─────────────────────────────────────────────────────────
   7. INIT
   ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyBusinessConfig();
  initOverlayClickDismiss();
  initEscapeKey();
});
