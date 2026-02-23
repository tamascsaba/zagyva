# Chrome Web Store Listing Info

## Name
Zagyva

## Short Description (max 132 chars)
Hides 2026 Hungarian election-related articles and videos on YouTube, Facebook, and major Hungarian news sites.

## Detailed Description
When the time comes, I'll go vote. Until then, leave me alone.

Tired of election noise cluttering your feed? Zagyva automatically hides 2026 Hungarian election-related content while you browse.

**How it works:**
- Scans article titles and video descriptions for election-related keywords
- Hides matching content with a single, invisible filter
- Works on page load and on dynamically loaded content (infinite scroll, SPA)

**Supported sites:**
YouTube, Facebook, Instagram, X (Twitter), TikTok, LinkedIn, Telex, 444.hu, 24.hu, Mandiner, HVG, Index, RTL, Portfolio, Magyar Hang, Origo

**Features:**
- Per-site toggle: enable or disable filtering for each site individually
- Editable keyword list: add, remove, or reset keywords anytime
- Accent-insensitive matching: "orban" matches "Orbán", handles Hungarian suffixes
- Prefix matching: "fidesz" matches "fidesznek", "fideszre", "fideszes"
- Session counter: see how many items were hidden
- No data collection, no tracking, fully local

**Privacy:**
This extension does not collect, transmit, or store any personal data. All settings are stored locally in your browser via chrome.storage.sync.

## Category
Productivity

## Language
English (primary), Hungarian

## Single Purpose Description (required by Google)
Hides 2026 Hungarian election-related content on supported websites based on a user-configurable keyword list.

## Permission Justifications

### storage
Stores user preferences: per-site enable/disable toggles, custom keyword list, and hidden item counter. All data stays local in the browser.

### activeTab
Used to display the popup with filtering status for the currently active tab.

### host_permissions (all listed domains)
Content scripts are injected into these sites to scan article titles and video descriptions for election-related keywords and hide matching elements from the page. No data is read, collected, or transmitted — the extension only modifies the page's DOM to hide matching content.

## Privacy Policy (inline, no URL needed for no-data extensions)
This extension does not collect, store, or transmit any personal data or browsing history. All user settings (site toggles, keyword list) are stored locally using Chrome's built-in storage API (chrome.storage.sync) and are never sent to any server. The extension operates entirely client-side.

## Screenshots
Generated automatically by running: npm run screenshots
Files are saved to the store/ directory.
Required: at least 1, size 1280x800 or 640x400.
