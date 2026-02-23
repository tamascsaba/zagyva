/**
 * Instagram site configuration.
 * Feed posts, reels, explore.
 */

var HE_Sites = HE_Sites || {};

HE_Sites.instagram = {
  id: 'instagram',
  hostnames: ['instagram.com', 'www.instagram.com'],
  selectors: {
    articleContainers: [
      'article',
      'div[role="presentation"]'
    ],
    textElements: ['span', 'p', '[dir="auto"]', 'a']
  }
};
