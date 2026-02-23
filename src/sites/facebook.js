/**
 * Facebook site configuration.
 * Feed posts, group posts, reels.
 */

var HE_Sites = HE_Sites || {};

HE_Sites.facebook = {
  id: 'facebook',
  hostnames: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'mbasic.facebook.com'],
  selectors: {
    articleContainers: [
      'div[role="article"]',
      '[data-pagelet]',
      '[role="feed"] > div'
    ],
    textElements: ['span', 'p', 'h1', 'h2', 'h3', '[dir="auto"]']
  }
};
