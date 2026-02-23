/**
 * Telex.hu site configuration.
 */

var HE_Sites = HE_Sites || {};

HE_Sites.telex = {
  id: 'telex',
  hostnames: ['telex.hu', 'www.telex.hu'],
  selectors: {
    articleContainers: [
      'article',
      '[class*="article"]',
      '[class*="card"]',
      '[class*="list__item"]',
      '[class*="teaser"]',
      'a[href*="/202"]'
    ],
    textElements: ['h2', 'h3', 'h4', 'a', '[class*="title"]', '[class*="headline"]']
  }
};
