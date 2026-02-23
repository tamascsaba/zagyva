/**
 * LinkedIn site configuration.
 * Feed posts, articles.
 */

var HE_Sites = HE_Sites || {};

HE_Sites.linkedin = {
  id: 'linkedin',
  hostnames: ['linkedin.com', 'www.linkedin.com'],
  selectors: {
    articleContainers: [
      'div[data-urn]',
      '[class*="feed-shared-update-v2"]',
      '[data-id*="urn"]',
      'article'
    ],
    textElements: ['span', 'p', 'h1', 'h2', 'h3', '[dir="ltr"]']
  }
};
