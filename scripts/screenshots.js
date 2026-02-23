/**
 * Generates Chrome Web Store assets automatically.
 *
 * Screenshots (1280x800, 24-bit PNG no alpha):
 *   store/screenshot-popup.png       - Popup UI centered on dark background
 *   store/screenshot-youtube.png     - YouTube search with filtering active
 *   store/screenshot-telex.png       - Telex.hu with filtering active
 *
 * Promo tiles (24-bit PNG no alpha):
 *   store/promo-small.png            - 440x280 small promo tile
 *   store/promo-marquee.png          - 1400x560 marquee promo tile
 *
 * Run with: npm run screenshots
 */

const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');
const { execSync } = require('child_process');

const EXTENSION_PATH = path.resolve(__dirname, '..');
const STORE_PATH = path.resolve(__dirname, '..', 'store');

function sleep(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

function stripAlpha(filePath) {
  try {
    execSync('sips -s format png --setProperty formatOptions 0 "' + filePath + '" --out "' + filePath + '"', {
      stdio: 'pipe',
    });
  } catch (e) {}
}

async function dismissCookieConsent(page) {
  var selectors = [
    'button[id*="accept"]',
    'button[class*="accept"]',
    'button[class*="consent"]',
    '[aria-label*="Accept"]',
    '[aria-label*="Elfogad"]',
    '#onetrust-accept-btn-handler',
    '#didomi-notice-agree-button',
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
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
          await sleep(1000);
          return true;
        }
      }
    } catch (e) {}
  }

  try {
    return await page.evaluate(function () {
      var buttons = document.querySelectorAll('button, a[role="button"], [role="button"]');
      var words = ['accept', 'elfogad', 'hozzájárul', 'rendben', 'agree', 'megértettem'];
      for (var i = 0; i < buttons.length; i++) {
        var text = (buttons[i].textContent || '').toLowerCase().trim();
        for (var j = 0; j < words.length; j++) {
          if (text.indexOf(words[j]) >= 0) {
            var rect = buttons[i].getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              buttons[i].click();
              return true;
            }
          }
        }
      }
      return false;
    });
  } catch (e) { return false; }
}

/**
 * Creates a promo tile HTML page and screenshots it at the given size.
 */
async function generatePromoTile(browser, width, height, filename) {
  var page = await browser.newPage();
  await page.setViewport({ width: width, height: height });

  var isSmall = width < 600;
  var titleSize = isSmall ? Math.round(height * 0.15) : Math.round(height * 0.13);
  var taglineSize = isSmall ? Math.round(height * 0.065) : Math.round(height * 0.055);
  var badgeSize = isSmall ? Math.round(height * 0.045) : Math.round(height * 0.038);
  var badgePadV = Math.round(height * 0.018);
  var badgePadH = Math.round(height * 0.035);
  var gap = Math.round(width * 0.012);

  await page.setContent(`
    <html>
    <body style="margin:0;padding:0;width:${width}px;height:${height}px;
      background:linear-gradient(135deg,#0f0f14 0%,#1a1a2e 40%,#0f3460 100%);
      display:flex;align-items:center;justify-content:center;flex-direction:column;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#fff;">
      <div style="font-size:${titleSize}px;font-weight:800;letter-spacing:-0.03em;margin-bottom:${Math.round(height * 0.025)}px;">
        Zagyva
      </div>
      <div style="font-size:${taglineSize}px;color:#c0c0c8;max-width:85%;text-align:center;line-height:1.35;margin-bottom:${Math.round(height * 0.05)}px;">
        Your feed. Without the election noise.
      </div>
      <div style="display:flex;gap:${gap}px;flex-wrap:wrap;justify-content:center;max-width:90%;">
        <span style="background:rgba(74,158,255,0.15);border:1px solid rgba(74,158,255,0.4);color:#7dbfff;padding:${badgePadV}px ${badgePadH}px;border-radius:20px;font-size:${badgeSize}px;font-weight:500;">YouTube</span>
        <span style="background:rgba(74,158,255,0.15);border:1px solid rgba(74,158,255,0.4);color:#7dbfff;padding:${badgePadV}px ${badgePadH}px;border-radius:20px;font-size:${badgeSize}px;font-weight:500;">Facebook</span>
        <span style="background:rgba(74,158,255,0.15);border:1px solid rgba(74,158,255,0.4);color:#7dbfff;padding:${badgePadV}px ${badgePadH}px;border-radius:20px;font-size:${badgeSize}px;font-weight:500;">Instagram</span>
        <span style="background:rgba(74,158,255,0.15);border:1px solid rgba(74,158,255,0.4);color:#7dbfff;padding:${badgePadV}px ${badgePadH}px;border-radius:20px;font-size:${badgeSize}px;font-weight:500;">X</span>
        <span style="background:rgba(74,158,255,0.15);border:1px solid rgba(74,158,255,0.4);color:#7dbfff;padding:${badgePadV}px ${badgePadH}px;border-radius:20px;font-size:${badgeSize}px;font-weight:500;">Telex</span>
        <span style="background:rgba(74,158,255,0.15);border:1px solid rgba(74,158,255,0.4);color:#7dbfff;padding:${badgePadV}px ${badgePadH}px;border-radius:20px;font-size:${badgeSize}px;font-weight:500;">444</span>
        <span style="background:rgba(74,158,255,0.15);border:1px solid rgba(74,158,255,0.4);color:#7dbfff;padding:${badgePadV}px ${badgePadH}px;border-radius:20px;font-size:${badgeSize}px;font-weight:500;">+10 more</span>
      </div>
    </body>
    </html>
  `, { waitUntil: 'domcontentloaded' });
  await sleep(500);
  var outPath = path.join(STORE_PATH, filename);
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: width, height: height } });
  stripAlpha(outPath);
  console.log('  Saved: ' + filename + ' (' + width + 'x' + height + ')');
  await page.close();
}

async function main() {
  if (!fs.existsSync(STORE_PATH)) {
    fs.mkdirSync(STORE_PATH, { recursive: true });
  }

  console.log('Launching browser with extension...');
  var browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-extensions-except=' + EXTENSION_PATH,
      '--load-extension=' + EXTENSION_PATH,
      '--window-size=1280,900',
    ],
  });

  await sleep(2000);

  // --- Screenshot 1: Popup UI on a 1280x800 canvas ---
  console.log('Taking popup screenshot (1280x800)...');
  var popupPage = await browser.newPage();
  await popupPage.setViewport({ width: 1280, height: 800 });

  var popupCSS = fs.readFileSync(path.join(EXTENSION_PATH, 'popup', 'popup.css'), 'utf8');
  var popupHTML = fs.readFileSync(path.join(EXTENSION_PATH, 'popup', 'popup.html'), 'utf8');

  var bodyMatch = popupHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  var popupBody = bodyMatch ? bodyMatch[1] : '';
  popupBody = popupBody.replace(/<script[\s\S]*?<\/script>/gi, '');

  await popupPage.setContent(`
    <html>
    <head>
      <style>
        html, body {
          margin: 0; padding: 0;
          width: 1280px; height: 800px;
          background: linear-gradient(135deg, #0d0d0f 0%, #141420 40%, #1a1a2e 100%);
          display: flex; align-items: center; justify-content: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .popup-frame {
          width: 360px;
          max-height: 720px;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
          overflow: hidden;
        }
        ${popupCSS}
        body { width: 360px !important; min-height: auto !important; }
        .popup { padding: 12px 16px !important; }
        .header { margin-bottom: 12px !important; padding-bottom: 10px !important; }
        .toggles { gap: 3px !important; }
        .toggle-row { padding: 5px 10px !important; }
        .section { margin-bottom: 12px !important; }
        .keywords-input { rows: 4; height: 60px !important; }
        .section-title { margin-bottom: 6px !important; }
      </style>
    </head>
    <body>
      <div class="popup-frame">
        ${popupBody}
      </div>
    </body>
    </html>
  `, { waitUntil: 'domcontentloaded' });

  // Populate the toggles and keywords manually since popup.js needs chrome APIs
  await popupPage.evaluate(function () {
    var sites = [
      { id: 'youtube', label: 'YouTube', on: true },
      { id: 'facebook', label: 'Facebook', on: true },
      { id: 'instagram', label: 'Instagram', on: true },
      { id: 'x', label: 'X (Twitter)', on: true },
      { id: 'tiktok', label: 'TikTok', on: false },
      { id: 'linkedin', label: 'LinkedIn', on: false },
      { id: 'telex', label: 'Telex', on: true },
      { id: '444', label: '444.hu', on: true },
      { id: '24hu', label: '24.hu', on: true },
      { id: 'mandiner', label: 'Mandiner', on: true },
      { id: 'hvg', label: 'HVG', on: true },
      { id: 'index', label: 'Index', on: true },
      { id: 'rtl', label: 'RTL', on: true },
      { id: 'portfolio', label: 'Portfolio', on: true },
      { id: 'magyarhang', label: 'Magyar Hang', on: true },
      { id: 'origo', label: 'Origo', on: true },
    ];
    var container = document.getElementById('site-toggles');
    if (!container) return;
    container.innerHTML = '';
    sites.forEach(function (s) {
      var row = document.createElement('div');
      row.className = 'toggle-row';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'toggle-' + s.id;
      cb.checked = s.on;
      var label = document.createElement('label');
      label.htmlFor = cb.id;
      var text = document.createElement('span');
      text.textContent = s.label;
      var sw = document.createElement('span');
      sw.className = 'switch';
      label.appendChild(text);
      label.appendChild(sw);
      row.appendChild(cb);
      row.appendChild(label);
      container.appendChild(row);
    });

    var kwInput = document.getElementById('keywords-input');
    if (kwInput) {
      kwInput.value = 'fidesz\nkdnp\ntisza\norbán\nválasztás\nkampány\nparlament\nellenzék\nkoalíció\n...and 120+ more';
    }

    var count = document.getElementById('hidden-count');
    if (count) count.textContent = '47';
  });

  await sleep(1000);
  var outPopup = path.join(STORE_PATH, 'screenshot-popup.png');
  await popupPage.screenshot({
    path: outPopup,
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  stripAlpha(outPopup);
  console.log('  Saved: screenshot-popup.png (1280x800)');
  await popupPage.close();

  // --- Screenshot 2: YouTube search ---
  console.log('Taking YouTube screenshot (1280x800)...');
  var pageYT = await browser.newPage();
  await pageYT.setViewport({ width: 1280, height: 800 });
  await pageYT.goto(
    'https://www.youtube.com/results?search_query=magyar+v%C3%A1laszt%C3%A1s+2026',
    { waitUntil: 'domcontentloaded', timeout: 30000 }
  );
  await sleep(2000);
  await dismissCookieConsent(pageYT);
  await sleep(6000);
  var outYT = path.join(STORE_PATH, 'screenshot-youtube.png');
  await pageYT.screenshot({
    path: outYT,
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  stripAlpha(outYT);
  var countYT = await pageYT.$$eval('[data-he-hidden]', function (els) { return els.length; });
  console.log('  Saved: screenshot-youtube.png (' + countYT + ' items hidden)');
  await pageYT.close();

  // --- Screenshot 3: Telex.hu ---
  console.log('Taking Telex screenshot (1280x800)...');
  var pageTelex = await browser.newPage();
  await pageTelex.setViewport({ width: 1280, height: 800 });
  await pageTelex.goto('https://telex.hu/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(2000);
  await dismissCookieConsent(pageTelex);
  await sleep(4000);
  var outTelex = path.join(STORE_PATH, 'screenshot-telex.png');
  await pageTelex.screenshot({
    path: outTelex,
    clip: { x: 0, y: 0, width: 1280, height: 800 },
  });
  stripAlpha(outTelex);
  var countTelex = await pageTelex.$$eval('[data-he-hidden]', function (els) { return els.length; });
  console.log('  Saved: screenshot-telex.png (' + countTelex + ' items hidden)');
  await pageTelex.close();

  // --- Promo tiles ---
  console.log('Generating promo tiles...');
  await generatePromoTile(browser, 440, 280, 'promo-small.png');
  await generatePromoTile(browser, 1400, 560, 'promo-marquee.png');

  await browser.close();

  // Verify sizes
  console.log('\nVerifying output sizes...');
  var files = ['screenshot-popup.png', 'screenshot-youtube.png', 'screenshot-telex.png',
    'promo-small.png', 'promo-marquee.png'];
  files.forEach(function (f) {
    var fp = path.join(STORE_PATH, f);
    if (fs.existsSync(fp)) {
      var out = execSync('sips -g pixelWidth -g pixelHeight "' + fp + '"', { encoding: 'utf8' });
      var w = out.match(/pixelWidth:\s*(\d+)/);
      var h = out.match(/pixelHeight:\s*(\d+)/);
      console.log('  ' + f + ': ' + (w ? w[1] : '?') + 'x' + (h ? h[1] : '?'));
    }
  });

  console.log('\nAll assets saved to store/ directory.');
}

main().catch(function (err) {
  console.error('Screenshot generation failed:', err);
  process.exit(1);
});
