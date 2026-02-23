/**
 * 444.hu site configuration.
 */

var HE_Sites = HE_Sites || {};

HE_Sites['444'] = {
  id: '444',
  hostnames: ['444.hu', 'www.444.hu', 'jo.444.hu'],
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
