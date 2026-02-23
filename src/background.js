/**
 * Background service worker.
 * Initializes default storage on install, merges new defaults on update.
 */

importScripts('keywords.js');

chrome.runtime.onInstalled.addListener(function (details) {
  var defaults = typeof DEFAULT_KEYWORDS !== 'undefined' ? DEFAULT_KEYWORDS : [];

  chrome.storage.sync.get(['keywords'], function (result) {
    if (!result.keywords || !Array.isArray(result.keywords) || result.keywords.length === 0) {
      chrome.storage.sync.set({ keywords: defaults });
    } else if (details.reason === 'update') {
      var existing = result.keywords;
      var existingSet = {};
      for (var i = 0; i < existing.length; i++) {
        existingSet[existing[i].toLowerCase()] = true;
      }
      var merged = existing.slice();
      for (var j = 0; j < defaults.length; j++) {
        if (!existingSet[defaults[j].toLowerCase()]) {
          merged.push(defaults[j]);
        }
      }
      if (merged.length > existing.length) {
        chrome.storage.sync.set({ keywords: merged });
      }
    }
  });
});
