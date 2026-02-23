/**
 * Popup UI logic.
 */

(function () {
  'use strict';

  var SITE_IDS = [
    { id: 'youtube', label: 'YouTube' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'x', label: 'X (Twitter)' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'telex', label: 'Telex' },
    { id: '444', label: '444.hu' },
    { id: '24hu', label: '24.hu' },
    { id: 'mandiner', label: 'Mandiner' },
    { id: 'hvg', label: 'HVG' },
    { id: 'index', label: 'Index' },
    { id: 'rtl', label: 'RTL' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'magyarhang', label: 'Magyar Hang' },
    { id: 'origo', label: 'Origo' }
  ];

  var FALLBACK_KEYWORDS = (typeof DEFAULT_KEYWORDS !== 'undefined') ? DEFAULT_KEYWORDS : [];

  function getStorage() {
    return new Promise(function (resolve) {
      chrome.storage.sync.get(null, function (result) {
        var siteEnabled = {};
        SITE_IDS.forEach(function (s) {
          var key = 'siteEnabled_' + s.id;
          siteEnabled[s.id] = result[key] !== false;
        });
        resolve({
          siteEnabled: siteEnabled,
          keywords: Array.isArray(result.keywords) ? result.keywords : FALLBACK_KEYWORDS,
          hiddenCount: typeof result.hiddenCount === 'number' ? result.hiddenCount : 0
        });
      });
    });
  }

  function setSiteEnabled(siteId, enabled) {
    var obj = {};
    obj['siteEnabled_' + siteId] = enabled;
    return new Promise(function (resolve) {
      chrome.storage.sync.set(obj, resolve);
    });
  }

  function setKeywords(keywords) {
    var arr = Array.isArray(keywords) ? keywords : keywords.split('\n').map(function (s) {
      return s.trim();
    }).filter(Boolean);
    var obj = { keywords: arr };
    return new Promise(function (resolve) {
      chrome.storage.sync.set(obj, resolve);
    });
  }

  function resetKeywords() {
    return setKeywords(FALLBACK_KEYWORDS);
  }

  function resetHiddenCount() {
    return new Promise(function (resolve) {
      chrome.storage.sync.set({ hiddenCount: 0 }, resolve);
    });
  }

  function renderToggles(data) {
    var container = document.getElementById('site-toggles');
    container.innerHTML = '';
    SITE_IDS.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'toggle-row';
      var id = 'toggle-' + s.id;
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = id;
      cb.checked = data.siteEnabled[s.id] !== false;
      cb.addEventListener('change', function () {
        setSiteEnabled(s.id, cb.checked);
      });
      var label = document.createElement('label');
      label.htmlFor = id;
      var labelText = document.createElement('span');
      labelText.textContent = s.label;
      var sw = document.createElement('span');
      sw.className = 'switch';
      label.appendChild(labelText);
      label.appendChild(sw);
      row.appendChild(cb);
      row.appendChild(label);
      container.appendChild(row);
    });
  }

  function init() {
    getStorage().then(function (data) {
      renderToggles(data);
      document.getElementById('keywords-input').value = (data.keywords || []).join('\n');
      document.getElementById('hidden-count').textContent = String(data.hiddenCount);

      document.getElementById('save-keywords').addEventListener('click', function () {
        var text = document.getElementById('keywords-input').value;
        var keywords = text.split('\n').map(function (s) {
          return s.trim();
        }).filter(Boolean);
        setKeywords(keywords).then(function () {
          var btn = document.getElementById('save-keywords');
          var orig = btn.textContent;
          btn.textContent = 'Saved!';
          setTimeout(function () {
            btn.textContent = orig;
          }, 1500);
        });
      });

      document.getElementById('reset-keywords').addEventListener('click', function () {
        resetKeywords().then(function () {
          document.getElementById('keywords-input').value = FALLBACK_KEYWORDS.join('\n');
        });
      });

      document.getElementById('reset-count').addEventListener('click', function () {
        resetHiddenCount().then(function () {
          document.getElementById('hidden-count').textContent = '0';
        });
      });
    });
  }

  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName !== 'sync' || !changes.hiddenCount) return;
    document.getElementById('hidden-count').textContent = String(changes.hiddenCount.newValue || 0);
  });

  init();
})();
