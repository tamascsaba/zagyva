/**
 * Tests for the keyword matcher.
 * Run with: node test/matcher.test.js
 */

// Simulate browser globals for Node.js
var HE_Matcher = {};

HE_Matcher._cache = {};

HE_Matcher.normalize = function (str) {
  if (typeof str !== 'string') return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

HE_Matcher.escapeRegex = function (keyword) {
  return keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

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

HE_Matcher.clearCache = function () {
  HE_Matcher._cache = {};
};

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

// Test runner
var passed = 0;
var failed = 0;

function test(name, actual, expected) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.log('FAIL: ' + name);
    console.log('  expected: ' + expected + ', got: ' + actual);
    // Debug: show normalized text and regex
    console.log('  (debug info logged above)');
  }
}

function debugMatch(text, keyword) {
  var nt = HE_Matcher.normalize(text);
  var nk = HE_Matcher.normalize(keyword).trim();
  var re = HE_Matcher.getRegex(nk);
  console.log('  text: "' + text + '" -> normalized: "' + nt + '"');
  console.log('  keyword: "' + keyword + '" -> normalized: "' + nk + '"');
  console.log('  regex: ' + re);
  console.log('  result: ' + (re ? re.test(nt) : 'no regex'));
}

console.log('--- Hungarian suffix (agglutination) tests ---');

test('fidesz exact', HE_Matcher.matches('Fidesz', ['fidesz']), true);
test('fidesznek (suffix -nek)', HE_Matcher.matches('A Fidesznek nincs esélye', ['fidesz']), true);
test('fideszre (suffix -re)', HE_Matcher.matches('Fideszre szavazok', ['fidesz']), true);
test('fideszes (suffix -es)', HE_Matcher.matches('Fideszes politikus', ['fidesz']), true);
test('fideszt (suffix -t)', HE_Matcher.matches('A Fideszt kritizálják', ['fidesz']), true);
test('fideszből (suffix -ből)', HE_Matcher.matches('A Fideszből kilépett', ['fidesz']), true);

test('tiszának (suffix -nak)', HE_Matcher.matches('A Tiszának van esélye', ['tisza']), true);
test('tiszás (suffix -s)', HE_Matcher.matches('Tiszás szavazók', ['tisza']), true);
test('tiszáról (suffix -ról)', HE_Matcher.matches('A Tiszáról beszéltek', ['tisza']), true);
test('tiszát (suffix -t)', HE_Matcher.matches('A Tiszát támogatják', ['tisza']), true);

test('orbánnak (suffix -nak)', HE_Matcher.matches('Orbánnak üzentek', ['orbán']), true);
test('orbánt (suffix -t)', HE_Matcher.matches('Orbánt kérdezték', ['orbán']), true);
test('orbánról (suffix -ról)', HE_Matcher.matches('Orbánról szólt a hír', ['orbán']), true);

test('választási (suffix -i)', HE_Matcher.matches('Választási kampány', ['választás']), true);
test('választásra (suffix -ra)', HE_Matcher.matches('A választásra készülnek', ['választás']), true);
test('választásokat (suffix -okat)', HE_Matcher.matches('A választásokat megtartják', ['választás']), true);

console.log('\n--- Punctuation tests ---');

test('tisza, (comma)', HE_Matcher.matches('Tisza, a párt', ['tisza']), true);
test('tisza. (period)', HE_Matcher.matches('Ez a Tisza.', ['tisza']), true);
test('tisza! (excl)', HE_Matcher.matches('Éljen a Tisza!', ['tisza']), true);
test('tisza? (question)', HE_Matcher.matches('Mi az a Tisza?', ['tisza']), true);
test('(tisza) parens', HE_Matcher.matches('A párt (Tisza) nyert', ['tisza']), true);
test('"tisza" quotes', HE_Matcher.matches('A "Tisza" párt', ['tisza']), true);
test('fidesz, comma', HE_Matcher.matches('Fidesz, KDNP', ['fidesz']), true);

console.log('\n--- Word at start of text ---');

test('word at very start', HE_Matcher.matches('Fidesz won', ['fidesz']), true);
test('word at start with suffix', HE_Matcher.matches('Fidesznek van', ['fidesz']), true);
test('tisza at start', HE_Matcher.matches('Tiszának üzentek', ['tisza']), true);

console.log('\n--- Accent-insensitive tests ---');

test('orban matches Orbán', HE_Matcher.matches('Orbán Viktor', ['orban']), true);
test('orbán matches orban', HE_Matcher.matches('orban viktor', ['orbán']), true);
test('valasztas matches választás', HE_Matcher.matches('A választás napja', ['valasztas']), true);
test('választás matches valasztas text', HE_Matcher.matches('A valasztas napja', ['választás']), true);

console.log('\n--- Case-insensitive tests ---');

test('FIDESZ matches fidesz', HE_Matcher.matches('FIDESZ', ['fidesz']), true);
test('fidesz matches FIDESZ keyword', HE_Matcher.matches('fidesz', ['FIDESZ']), true);

console.log('\n--- Multi-word keyword tests ---');

test('magyar peter exact', HE_Matcher.matches('Magyar Péter beszédet mondott', ['magyar péter']), true);
test('magyar péternek suffix', HE_Matcher.matches('Magyar Péternek üzentek', ['magyar péter']), true);
test('magyar péterről suffix', HE_Matcher.matches('Magyar Péterről írtak cikket', ['magyar péter']), true);

console.log('\n--- False positive prevention ---');

test('partial inside word: "art" in "department"', HE_Matcher.matches('the department is closed', ['art']), false);
test('partial inside word: "part" in "department"', HE_Matcher.matches('the department is closed', ['part']), false);
test('partial inside word: "men" in "moment"', HE_Matcher.matches('At that moment', ['men']), false);

console.log('\n--- Summary ---');
console.log('Passed: ' + passed + '/' + (passed + failed));
if (failed > 0) {
  console.log('Failed: ' + failed);
  process.exit(1);
} else {
  console.log('All tests passed!');
}
