/**
 * Cliff 앱 ↔ 로딩 콘텐츠(웹) 브리지.
 *
 * 웹 → 앱:
 *   - `window.webkit.messageHandlers.cliffContentState.postMessage('active'|'idle')`
 *   - `window.webkit.messageHandlers.cliffShare.postMessage(dataURL)`
 *
 * 앱 → 웹:
 *   - `window.__cliffProcessingDone()`
 */
window.CliffBridge = (function () {
  'use strict';

  var inApp = /CliffApp/i.test(navigator.userAgent);
  var processingDone = false;
  var listeners = [];

  function postContentState(state) {
    if (inApp && window.webkit && window.webkit.messageHandlers &&
        window.webkit.messageHandlers.cliffContentState) {
      window.webkit.messageHandlers.cliffContentState.postMessage(state);
    }
  }

  window.__cliffProcessingDone = function () {
    if (processingDone) return;
    processingDone = true;
    listeners.forEach(function (fn) {
      try { fn(); } catch (e) { /* keep other listeners alive */ }
    });
  };

  return {
    inApp: inApp,
    contentStart: function () { postContentState('active'); },
    contentEnd: function () { postContentState('idle'); },
    isProcessingDone: function () { return processingDone; },
    onProcessingDone: function (fn) {
      listeners.push(fn);
      if (processingDone) {
        try { fn(); } catch (e) {}
      }
    },
    shareImage: function (dataURL) {
      if (inApp && window.webkit && window.webkit.messageHandlers &&
          window.webkit.messageHandlers.cliffShare) {
        window.webkit.messageHandlers.cliffShare.postMessage(dataURL);
        return true;
      }
      return false;
    },
  };
})();
