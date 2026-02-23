/**
 * Mandiner.hu site configuration.
 */

var HE_Sites = HE_Sites || {};

HE_Sites.mandiner = {
  id: 'mandiner',
  hostnames: ['mandiner.hu', 'www.mandiner.hu'],
  selectors: {
    articleContainers: [
      'article',
      '[class*="article"]',
      '[class*="card"]',
      '[class*="list"] [class*="item"]',
      '[class*="teaser"]',
      'a[href*="/20"]'
    ],
    textElements: ['h2', 'h3', 'h4', 'a', '[class*="title"]', '[class*="headline"]']
  }
};
