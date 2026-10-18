/* MSME Knowledge Hub — GA4 interaction tracking (no personal or financial inputs transmitted). */
(function () {
  'use strict';
  var calculators = /(?:calculator|repayment)/i.test(location.pathname);
  if (!calculators) return;
  document.addEventListener('click', function (event) {
    var target = event.target.closest('button, a, input[type="button"], input[type="submit"]');
    if (!target || typeof window.gtag !== 'function') return;
    var label = ((target.textContent || target.value || '') + ' ' + (target.getAttribute('aria-label') || '')).trim().toLowerCase();
    var action = '';
    if (/pdf|print|save as pdf/.test(label)) action = 'calculator_pdf_action_click';
    else if (/csv|spreadsheet/.test(label)) action = 'calculator_csv_download_click';
    else if (/calculat|गणना|compute|recalculat/.test(label)) action = 'calculator_calculate_click';
    else if (/reset|start new|clear all/.test(label)) action = 'calculator_reset_click';
    if (action) window.gtag('event', action, {calculator_page: location.pathname.split('/').pop() || 'index'});
  }, true);
})();
