/**
 * Content script for hiding election-related items.
 * Detects hostname, loads site config, observes DOM, hides election-related items.
 */

(function () {
  'use strict';

  var HIDDEN_ATTR = 'data-he-hidden';
  var currentKeywordsHash = '';
  var pendingHiddenCount = 0;
  var flushTimer = null;

  function getSiteConfig() {
    var hostname = window.location.hostname.replace(/^www\./, '');
    if (typeof HE_Sites === 'undefined' || !HE_Sites) return null;
    for (var id in HE_Sites) {
      if (!HE_Sites.hasOwnProperty(id)) continue;
      var config = HE_Sites[id];
      if (config.hostnames) {
        for (var i = 0; i < config.hostnames.length; i++) {
          var h = config.hostnames[i].replace(/^www\./, '');
          if (hostname === h || hostname.endsWith('.' + h)) return config;
        }
      }
    }
    return null;
  }

  function getTextFromElement(el) {
    var texts = [];
    function collect(node) {
      if (node.nodeType === 3) {
        var t = (node.textContent || '').trim();
        if (t) texts.push(t);
      } else if (node.nodeType === 1) {
        var tag = (node.tagName || '').toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'svg') return;
        for (var i = 0; i < node.childNodes.length; i++) collect(node.childNodes[i]);
      }
    }
    collect(el);
    return texts.join(' ');
  }

  function shouldHide(container, keywords, matcher) {
    if (!keywords || !keywords.length) return false;
    var text = getTextFromElement(container);
    return matcher.matches(text, keywords);
  }

  function hideElement(el) {
    if (el.getAttribute(HIDDEN_ATTR) === '1') return false;
    el.setAttribute(HIDDEN_ATTR, '1');
    el.style.setProperty('display', 'none', 'important');
    return true;
  }

  function unhideElement(el) {
    if (el.getAttribute(HIDDEN_ATTR) !== '1') return;
    el.removeAttribute(HIDDEN_ATTR);
    el.style.removeProperty('display');
  }

  function unhideAll() {
    var hidden = document.querySelectorAll('[' + HIDDEN_ATTR + ']');
    for (var i = 0; i < hidden.length; i++) {
      unhideElement(hidden[i]);
    }
  }

  function flushHiddenCount() {
    if (pendingHiddenCount <= 0) return;
    var count = pendingHiddenCount;
    pendingHiddenCount = 0;
    chrome.storage.sync.get('hiddenCount', function (result) {
      var current = (result.hiddenCount || 0) + count;
      chrome.storage.sync.set({ hiddenCount: current });
    });
  }

  function scheduleFlush() {
    if (flushTimer) return;
    flushTimer = setTimeout(function () {
      flushTimer = null;
      flushHiddenCount();
    }, 500);
  }

  function keywordsHash(keywords) {
    if (!keywords || !keywords.length) return '';
    return keywords.join('|');
  }

  function scanAndHide(config, keywords, matcher) {
    if (!config || !config.selectors || !config.selectors.articleContainers) return;
    var containers = config.selectors.articleContainers;
    var newHash = keywordsHash(keywords);
    var keywordsChanged = newHash !== currentKeywordsHash;
    currentKeywordsHash = newHash;

    for (var i = 0; i < containers.length; i++) {
      try {
        var nodes = document.querySelectorAll(containers[i]);
        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          var wasHidden = node.getAttribute(HIDDEN_ATTR) === '1';

          if (!keywordsChanged && wasHidden) continue;

          if (shouldHide(node, keywords, matcher)) {
            if (hideElement(node)) {
              pendingHiddenCount++;
            }
          } else if (wasHidden) {
            unhideElement(node);
          }
        }
      } catch (e) {}
    }
    if (pendingHiddenCount > 0) scheduleFlush();
  }

  function run(enabled, keywords) {
    if (!enabled) {
      unhideAll();
      return;
    }
    if (!keywords || !keywords.length) return;
    var config = getSiteConfig();
    if (!config) return;
    var matcher = typeof HE_Matcher !== 'undefined' ? HE_Matcher : null;
    if (!matcher || !matcher.matches) return;
    scanAndHide(config, keywords, matcher);
  }

  var cachedSettings = null;

  function init() {
    HE_Storage.getAll().then(function (data) {
      cachedSettings = data;
      var siteConfig = getSiteConfig();
      if (!siteConfig) return;
      var enabled = data.siteEnabled && data.siteEnabled[siteConfig.id] !== false;
      run(enabled, data.keywords);
    });
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  HE_Storage.onChange(function (delta) {
    var siteConfig = getSiteConfig();
    if (!siteConfig) return;

    if (cachedSettings) {
      if (delta.siteEnabled) {
        for (var k in delta.siteEnabled) {
          cachedSettings.siteEnabled[k] = delta.siteEnabled[k];
        }
      }
      if (delta.keywords) {
        cachedSettings.keywords = delta.keywords;
      }
    }

    var enabled = cachedSettings
      ? cachedSettings.siteEnabled[siteConfig.id] !== false
      : true;

    if (delta.siteEnabled && delta.siteEnabled[siteConfig.id] !== undefined) {
      enabled = delta.siteEnabled[siteConfig.id];
    }

    var keywords = cachedSettings ? cachedSettings.keywords : delta.keywords;
    if (keywords) {
      run(enabled, keywords);
    } else {
      HE_Storage.getAll().then(function (data) {
        cachedSettings = data;
        run(enabled, data.keywords);
      });
    }
  });

  init();

  var scheduleScan = debounce(function () {
    if (!cachedSettings) {
      HE_Storage.getAll().then(function (data) {
        cachedSettings = data;
        var siteConfig = getSiteConfig();
        if (!siteConfig) return;
        var enabled = data.siteEnabled && data.siteEnabled[siteConfig.id] !== false;
        run(enabled, data.keywords);
      });
    } else {
      var siteConfig = getSiteConfig();
      if (!siteConfig) return;
      var enabled = cachedSettings.siteEnabled && cachedSettings.siteEnabled[siteConfig.id] !== false;
      run(enabled, cachedSettings.keywords);
    }
  }, 300);

  var obs = new MutationObserver(function (mutations) {
    var hasRelevant = false;
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes && mutations[i].addedNodes.length) {
        hasRelevant = true;
        break;
      }
    }
    if (hasRelevant) scheduleScan();
  });

  var root = document.body || document.documentElement;
  if (root) {
    obs.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
