/**
 * Storage utilities for extension settings.
 * Uses chrome.storage.sync for site toggles and keywords.
 */

var HE_Storage = HE_Storage || {};

var SITE_IDS = [
  'youtube',
  'facebook',
  'instagram',
  'x',
  'tiktok',
  'linkedin',
  'telex',
  '444',
  '24hu',
  'mandiner',
  'hvg',
  'index',
  'rtl',
  'portfolio',
  'magyarhang',
  'origo'
];

var STORAGE_KEYS = {
  SITE_ENABLED: 'siteEnabled',
  KEYWORDS: 'keywords',
  HIDDEN_COUNT: 'hiddenCount'
};

/**
 * Gets the full storage key for a site's enabled state.
 * @param {string} siteId - Site identifier
 * @returns {string}
 */
HE_Storage.getSiteKey = function (siteId) {
  return STORAGE_KEYS.SITE_ENABLED + '_' + siteId;
};

/**
 * Gets all settings from storage.
 * @returns {Promise<{siteEnabled: Object, keywords: string[]}>}
 */
HE_Storage.getAll = function () {
  return new Promise(function (resolve) {
    var keys = [STORAGE_KEYS.KEYWORDS, STORAGE_KEYS.HIDDEN_COUNT];
    SITE_IDS.forEach(function (id) {
      keys.push(HE_Storage.getSiteKey(id));
    });
    chrome.storage.sync.get(keys, function (result) {
      var siteEnabled = {};
      SITE_IDS.forEach(function (id) {
        var key = HE_Storage.getSiteKey(id);
        siteEnabled[id] = result[key] !== false;
      });
      resolve({
        siteEnabled: siteEnabled,
        keywords: Array.isArray(result[STORAGE_KEYS.KEYWORDS])
          ? result[STORAGE_KEYS.KEYWORDS]
          : (DEFAULT_KEYWORDS || []),
        hiddenCount: typeof result[STORAGE_KEYS.HIDDEN_COUNT] === 'number'
          ? result[STORAGE_KEYS.HIDDEN_COUNT]
          : 0
      });
    });
  });
};

/**
 * Sets whether filtering is enabled for a site.
 * @param {string} siteId - Site identifier
 * @param {boolean} enabled - Enable flag
 * @returns {Promise<void>}
 */
HE_Storage.setSiteEnabled = function (siteId, enabled) {
  var obj = {};
  obj[HE_Storage.getSiteKey(siteId)] = enabled;
  return new Promise(function (resolve) {
    chrome.storage.sync.set(obj, resolve);
  });
};

/**
 * Sets the keyword list.
 * @param {string[]} keywords - Array of keyword strings
 * @returns {Promise<void>}
 */
HE_Storage.setKeywords = function (keywords) {
  var arr = Array.isArray(keywords) ? keywords : [];
  var obj = {};
  obj[STORAGE_KEYS.KEYWORDS] = arr;
  return new Promise(function (resolve) {
    chrome.storage.sync.set(obj, resolve);
  });
};

/**
 * Resets keywords to defaults.
 * @returns {Promise<void>}
 */
HE_Storage.resetKeywords = function () {
  return HE_Storage.setKeywords(DEFAULT_KEYWORDS || []);
};

/**
 * Resets hidden count to 0.
 * @returns {Promise<void>}
 */
HE_Storage.resetHiddenCount = function () {
  var obj = {};
  obj[STORAGE_KEYS.HIDDEN_COUNT] = 0;
  return new Promise(function (resolve) {
    chrome.storage.sync.set(obj, resolve);
  });
};

/**
 * Listens for storage changes (e.g. from popup).
 * @param {function(object)} callback - Called with { siteEnabled?, keywords? }
 */
HE_Storage.onChange = function (callback) {
  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName !== 'sync') return;
    var siteEnabled = {};
    var keywords;
    var prefix = STORAGE_KEYS.SITE_ENABLED + '_';
    for (var key in changes) {
      if (key.indexOf(prefix) === 0) {
        var siteId = key.substring(prefix.length);
        siteEnabled[siteId] = changes[key].newValue;
      } else if (key === STORAGE_KEYS.KEYWORDS) {
        keywords = changes[key].newValue;
      }
    }
    if (Object.keys(siteEnabled).length > 0 || keywords) {
      callback({ siteEnabled: siteEnabled, keywords: keywords });
    }
  });
};
