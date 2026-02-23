# Zagyva

A Chrome extension that hides 2026 Hungarian election-related articles and videos while browsing. Supports YouTube, Facebook and major Hungarian news portals, with per-site controls and a dynamically expandable keyword list.

> When the time comes, I'll go vote. Until then, leave me alone.

## Features

- **Per-site toggles** – Enable or disable filtering for each supported site individually
- **Keyword list** – Add, edit, or reset keywords; matching is case- and accent-insensitive
- **Session counter** – Shows how many items have been hidden in the current session
- **Dynamic updates** – New content (e.g. infinite scroll, SPA navigation) is filtered automatically

## Supported Sites

| Site | Domain |
|------|--------|
| YouTube | youtube.com |
| Facebook | facebook.com |
| Instagram | instagram.com |
| X (Twitter) | x.com, twitter.com |
| TikTok | tiktok.com |
| LinkedIn | linkedin.com |
| Telex | telex.hu |
| 444 | 444.hu |
| 24.hu | 24.hu, sokszinuvidek.24.hu |
| Mandiner | mandiner.hu |
| HVG | hvg.hu |
| Index | index.hu |
| RTL | rtl.hu |
| Portfolio | portfolio.hu |
| Magyar Hang | magyarhang.org |
| Origo | origo.hu |

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right)
4. Click **Load unpacked**
5. Select the `zagyva` folder (the one containing `manifest.json`)

## Usage

1. Click the Zagyva icon in the Chrome toolbar
2. Use the **Sites** section to enable or disable filtering per site
3. Use the **Keywords** section to view, edit, or reset keywords (one per line)
4. Click **Save** after editing keywords
5. The **Reset to defaults** button restores the built-in keyword list
6. The counter shows items hidden in the current session; use **Reset counter** to clear it

## Keyword Matching

- **Prefix matching**: a keyword matches even when the word has suffixes. This is essential for Hungarian, where words are heavily inflected. For example, "fidesz" matches "fidesznek", "fideszre", "fideszes", "fideszt", etc.
- **Accent-insensitive**: "orban" matches "Orbán", "valasztas" matches "választás"
- **Case-insensitive**: "FIDESZ" matches "fidesz"
- **Punctuation-aware**: "tisza" matches "tisza," or "tisza." or "(tisza)" etc.
- **Multi-word keywords**: "magyar peter" matches "Magyar Péternek" (prefix + accent-insensitive combined)

## Adding New Keywords

Edit the text area in the popup, add one keyword per line, and click **Save**. Keywords are stored in `chrome.storage.sync` and sync across your Chrome profile.

## Adding New Sites

To support additional sites:

1. Add a new file in `src/sites/` (e.g. `newsite.js`) with a config object
2. Add the hostname to `manifest.json` in `host_permissions` and `content_scripts.matches`
3. Add the site to `SITE_IDS` in `src/storage.js` and `popup/popup.js`

## Development

The extension uses Manifest V3. Key files:

- `manifest.json` – Extension manifest
- `src/content.js` – Main content script; scans DOM and hides matching items
- `src/matcher.js` – Keyword matching (accent- and case-insensitive)
- `src/keywords.js` – Default keyword list
- `src/sites/*.js` – Per-site CSS selectors
- `popup/` – Popup UI (HTML, CSS, JS)

## License

MIT
