/**
 * E2E tests for the extension using Puppeteer.
 *
 * - Mock page tests: loads local HTML fixtures, manually injects content scripts,
 *   verifies election-related articles are hidden while safe ones remain.
 * - Real site smoke tests: loads actual sites where the extension auto-injects,
 *   verifies filtering works on live content.
 *
 * Run with: npm run test:e2e
 */

const path = require('path');
const puppeteer = require('puppeteer');

const EXTENSION_PATH = path.resolve(__dirname, '..');
const FIXTURES_PATH = path.resolve(__dirname, 'fixtures');
const SRC_PATH = path.resolve(__dirname, '..', 'src');

function sleep(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

const CONTENT_SCRIPTS = [
  'keywords.js',
  'matcher.js',
  'storage.js',
  'sites/youtube.js',
  'sites/telex.js',
  'sites/444.js',
  'sites/24.js',
  'sites/mandiner.js',
  'sites/hvg.js',
  'sites/index.js',
  'sites/rtl.js',
  'sites/portfolio.js',
  'sites/magyarhang.js',
  'sites/origo.js',
  'sites/facebook.js',
  'sites/instagram.js',
  'sites/x.js',
  'sites/tiktok.js',
  'sites/linkedin.js',
  'content.js',
];

let browser;
let passed = 0;
let failed = 0;
const errors = [];

async function setup() {
  browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-extensions-except=' + EXTENSION_PATH,
      '--load-extension=' + EXTENSION_PATH,
    ],
  });
}

async function teardown() {
  if (browser) await browser.close();
}

function assert(name, actual, expected) {
  if (actual === expected) {
    passed++;
    console.log('  PASS: ' + name);
  } else {
    failed++;
    var msg = '  FAIL: ' + name + ' (expected ' + expected + ', got ' + actual + ')';
    console.log(msg);
    errors.push(msg);
  }
}

async function isHidden(page, selector) {
  return page.$eval(selector, function (el) {
    return el.style.display === 'none' || getComputedStyle(el).display === 'none';
  }).catch(function () { return null; });
}

async function isVisible(page, selector) {
  return page.$eval(selector, function (el) {
    var d = el.style.display || getComputedStyle(el).display;
    return d !== 'none';
  }).catch(function () { return null; });
}

async function countHidden(page) {
  return page.$$eval('[data-he-hidden]', function (els) { return els.length; });
}

/**
 * Injects the matcher + keywords into a page and runs a scan directly.
 * For file:// pages where hostname-based site detection won't work,
 * we provide a generic config and call the scan logic manually.
 */
async function injectAndScan(page, siteConfig) {
  await page.addScriptTag({ path: path.join(SRC_PATH, 'keywords.js') });
  await page.addScriptTag({ path: path.join(SRC_PATH, 'matcher.js') });

  await page.evaluate(function (config) {
    var HIDDEN_ATTR = 'data-he-hidden';

    function getTextFromElement(el) {
      var texts = [];
      (function collect(node) {
        if (node.nodeType === 3) {
          var t = (node.textContent || '').trim();
          if (t) texts.push(t);
        } else if (node.nodeType === 1) {
          var tag = (node.tagName || '').toLowerCase();
          if (tag === 'script' || tag === 'style' || tag === 'svg') return;
          for (var i = 0; i < node.childNodes.length; i++) collect(node.childNodes[i]);
        }
      })(el);
      return texts.join(' ');
    }

    var keywords = (typeof DEFAULT_KEYWORDS !== 'undefined') ? DEFAULT_KEYWORDS : [];
    var containers = config.articleContainers;

    for (var i = 0; i < containers.length; i++) {
      try {
        var nodes = document.querySelectorAll(containers[i]);
        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          var text = getTextFromElement(node);
          if (HE_Matcher.matches(text, keywords)) {
            node.setAttribute(HIDDEN_ATTR, '1');
            node.style.setProperty('display', 'none', 'important');
          }
        }
      } catch (e) {}
    }
  }, siteConfig);

  await sleep(500);
}

// ─── Mock page tests ────────────────────────────────────────────────

async function testMockNewsPage() {
  console.log('\n--- Mock news page (article selectors) ---');

  var page = await browser.newPage();
  await page.goto('file://' + path.join(FIXTURES_PATH, 'mock-news.html'), { waitUntil: 'domcontentloaded' });
  await injectAndScan(page, {
    articleContainers: ['article'],
  });

  var hiddenCount = await countHidden(page);
  console.log('  Hidden elements found: ' + hiddenCount);

  assert('election-article-1 (Orbán + választás) is hidden',
    await isHidden(page, '#election-article-1'), true);
  assert('election-article-2 (Fidesznek suffix) is hidden',
    await isHidden(page, '#election-article-2'), true);
  assert('election-article-3 (Magyar Péter) is hidden',
    await isHidden(page, '#election-article-3'), true);
  assert('election-article-suffix (Tiszának) is hidden',
    await isHidden(page, '#election-article-suffix'), true);
  assert('election-article-comma (Fidesz,) is hidden',
    await isHidden(page, '#election-article-comma'), true);
  assert('election-article-accent (valasztas no accents) is hidden',
    await isHidden(page, '#election-article-accent'), true);

  assert('safe-article-1 (weather) is visible',
    await isVisible(page, '#safe-article-1'), true);
  assert('safe-article-2 (recipe) is visible',
    await isVisible(page, '#safe-article-2'), true);
  assert('safe-article-3 (movie) is visible',
    await isVisible(page, '#safe-article-3'), true);

  await page.close();
}

async function testMockYouTubePage() {
  console.log('\n--- Mock YouTube page (ytd-* selectors) ---');

  var page = await browser.newPage();
  await page.goto('file://' + path.join(FIXTURES_PATH, 'mock-youtube.html'), { waitUntil: 'domcontentloaded' });
  await injectAndScan(page, {
    articleContainers: ['ytd-rich-item-renderer', 'ytd-video-renderer'],
  });

  var hiddenCount = await countHidden(page);
  console.log('  Hidden elements found: ' + hiddenCount);

  assert('yt-election-1 (Orbán + Fidesz) is hidden',
    await isHidden(page, '#yt-election-1'), true);
  assert('yt-election-2 (Magyar Péter) is hidden',
    await isHidden(page, '#yt-election-2'), true);
  assert('yt-election-3 (Választási kampány) is hidden',
    await isHidden(page, '#yt-election-3'), true);

  assert('yt-safe-1 (pizza recipe) is visible',
    await isVisible(page, '#yt-safe-1'), true);
  assert('yt-safe-2 (movies) is visible',
    await isVisible(page, '#yt-safe-2'), true);
  assert('yt-safe-3 (cat videos) is visible',
    await isVisible(page, '#yt-safe-3'), true);

  await page.close();
}

// ─── Cookie consent dismissal ───────────────────────────────────────

async function dismissCookieConsent(page) {
  var selectors = [
    'button[id*="accept"]',
    'button[id*="consent"]',
    'button[class*="accept"]',
    'button[class*="consent"]',
    'button[class*="cookie"]',
    'a[id*="accept"]',
    '[data-testid*="accept"]',
    '[data-testid*="consent"]',
    '[aria-label*="Accept"]',
    '[aria-label*="Elfogad"]',
    '[aria-label*="cookie"]',
    'button[title*="Accept"]',
    'button[title*="Elfogad"]',
    '#onetrust-accept-btn-handler',
    '.onetrust-accept-btn-handler',
    '#didomi-notice-agree-button',
    '.didomi-continue-without-agreeing',
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    '[class*="CookieConsent"] button',
    '[id*="CookieConsent"] button',
    '[class*="gdpr"] button',
    '[id*="gdpr"] button',
  ];

  for (var i = 0; i < selectors.length; i++) {
    try {
      var btn = await page.$(selectors[i]);
      if (btn) {
        var visible = await page.evaluate(function (el) {
          var rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }, btn);
        if (visible) {
          await btn.click();
          console.log('  (cookie consent dismissed via: ' + selectors[i] + ')');
          await sleep(1000);
          return;
        }
      }
    } catch (e) {}
  }

  // Fallback: try to find any visible button with accept/elfogad text
  try {
    var dismissed = await page.evaluate(function () {
      var buttons = document.querySelectorAll('button, a[role="button"], [role="button"]');
      var acceptWords = ['accept', 'elfogad', 'hozzájárul', 'rendben', 'agree', 'ok', 'megértettem'];
      for (var i = 0; i < buttons.length; i++) {
        var text = (buttons[i].textContent || '').toLowerCase().trim();
        for (var j = 0; j < acceptWords.length; j++) {
          if (text.indexOf(acceptWords[j]) >= 0) {
            var rect = buttons[i].getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              buttons[i].click();
              return acceptWords[j];
            }
          }
        }
      }
      return null;
    });
    if (dismissed) {
      console.log('  (cookie consent dismissed via text match: "' + dismissed + '")');
      await sleep(1000);
    }
  } catch (e) {}
}

// ─── Real site smoke tests ──────────────────────────────────────────

async function testRealSite(name, url, timeoutMs) {
  console.log('\n--- Real site: ' + name + ' (' + url + ') ---');

  var page = await browser.newPage();
  var consoleErrors = [];
  page.on('console', function (msg) {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await sleep(2000);
    await dismissCookieConsent(page);
    await sleep((timeoutMs || 5000) - 2000);

    var hiddenCount = await countHidden(page);
    console.log('  Hidden elements: ' + hiddenCount);

    var extensionErrors = consoleErrors.filter(function (e) {
      return e.indexOf('HE_') >= 0 || e.indexOf('content.js') >= 0;
    });

    assert(name + ': no extension errors in console',
      extensionErrors.length, 0);

    if (url.includes('search_query=fidesz') || url.includes('search_query=v%C3%A1laszt%C3%A1s')) {
      assert(name + ': at least some items hidden on election search', hiddenCount > 0, true);
    } else {
      console.log('  (info) Hidden count on live page: ' + hiddenCount + ' - varies by current content');
    }
  } catch (err) {
    console.log('  SKIP: Could not load ' + name + ': ' + err.message);
    console.log('  (this is expected if running without internet)');
  }
  await page.close();
}

// ─── Main ───────────────────────────────────────────────────────────

async function main() {
  console.log('Starting E2E tests...');
  console.log('Extension path: ' + EXTENSION_PATH);

  await setup();
  await sleep(2000);

  // Mock page tests (reliable, no network dependency)
  await testMockNewsPage();
  await testMockYouTubePage();

  // Real site smoke tests (network-dependent, best-effort)
  await testRealSite('YouTube election search',
    'https://www.youtube.com/results?search_query=fidesz+v%C3%A1laszt%C3%A1s+2026', 8000);
  await testRealSite('444.hu',
    'https://444.hu/', 6000);
  await testRealSite('Telex.hu',
    'https://telex.hu/', 6000);

  await teardown();

  console.log('\n=== Summary ===');
  console.log('Passed: ' + passed + '/' + (passed + failed));
  if (failed > 0) {
    console.log('Failed: ' + failed);
    errors.forEach(function (e) { console.log(e); });
    process.exit(1);
  } else {
    console.log('All tests passed!');
  }
}

main().catch(function (err) {
  console.error('E2E test crashed:', err);
  teardown().then(function () { process.exit(1); });
});
