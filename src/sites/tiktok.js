/**
 * TikTok site configuration.
 * For You feed, search results.
 */

var HE_Sites = HE_Sites || {};

HE_Sites.tiktok = {
  id: 'tiktok',
  hostnames: ['tiktok.com', 'www.tiktok.com'],
  selectors: {
    articleContainers: [
      'div[data-e2e="recommend-list-item-container"]',
      'div[data-e2e="search-card-desc"]',
      '[class*="DivItemContainer"]',
      'div[data-e2e="browse-video-desc"]'
    ],
    textElements: ['span', 'p', '[data-e2e="video-desc"]', '[data-e2e="search-card-desc"]', 'a']
  }
};
