/**
 * Text matching engine for election-related keywords.
 * Case-insensitive, accent-insensitive, prefix-based matching
 * to handle Hungarian agglutination (suffixes like -nek, -nak, -ban, -ból, etc.).
 * Caches compiled regex patterns for performance.
 */

var HE_Matcher = HE_Matcher || {};

HE_Matcher._cache = {};

/**
 * Normalizes text by stripping diacritics and lowering case.
 * @param {string} str
 * @returns {string}
 */
HE_Matcher.normalize = function (str) {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

/**
 * Escapes special regex characters.
 * @param {string} keyword
 * @returns {string}
 */
HE_Matcher.escapeRegex = function (keyword) {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Returns a cached compiled regex for a normalized keyword.
 * Uses \b at the START only (word must begin at a boundary) but NOT at the end,
 * so Hungarian suffixed forms match: "fidesz" matches "fidesznek", "fideszre", etc.
 * Multi-word keywords use flexible whitespace between parts.
 * @param {string} normalizedKeyword
 * @returns {RegExp|null}
 */
HE_Matcher.getRegex = function (normalizedKeyword) {
  var trimmed = normalizedKeyword.trim();
  if (!trimmed) return null;
  if (HE_Matcher._cache[trimmed]) return HE_Matcher._cache[trimmed];
  var parts = trimmed.split(/\s+/).map(function (p) {
    return HE_Matcher.escapeRegex(p);
  });
  var pattern = parts.join('[\\s\\-]+');
  try {
    var re = new RegExp('(?:^|[\\s,;:.!?()\\[\\]{}"\'/\\-])' + pattern, 'i');
    HE_Matcher._cache[trimmed] = re;
    return re;
  } catch (e) {
    return null;
  }
};

/**
 * Clears the compiled regex cache (call when keywords change).
 */
HE_Matcher.clearCache = function () {
  HE_Matcher._cache = {};
};

/**
 * Checks if text contains any of the given keywords.
 * @param {string} text
 * @param {string[]} keywords
 * @returns {boolean}
 */
HE_Matcher.matches = function (text, keywords) {
  if (!text || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return false;
  }
  var normalizedText = HE_Matcher.normalize(text);
  for (var i = 0; i < keywords.length; i++) {
    var kw = keywords[i];
    if (!kw || typeof kw !== 'string') continue;
    var normalizedKw = HE_Matcher.normalize(kw).trim();
    if (!normalizedKw) continue;
    var regex = HE_Matcher.getRegex(normalizedKw);
    if (regex && regex.test(normalizedText)) {
      return true;
    }
  }
  return false;
};
