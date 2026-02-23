/**
 * 24.hu site configuration.
 */

var HE_Sites = HE_Sites || {};

HE_Sites['24hu'] = {
  id: '24hu',
  hostnames: ['24.hu', 'www.24.hu', 'sokszinuvidek.24.hu'],
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
