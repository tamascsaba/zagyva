/**
 * X (Twitter) site configuration.
 */

var HE_Sites = HE_Sites || {};

HE_Sites.x = {
  id: 'x',
  hostnames: ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'],
  selectors: {
    articleContainers: [
      'article[data-testid="tweet"]',
      '[data-testid="cellInnerDiv"]'
    ],
    textElements: ['[data-testid="tweetText"]', 'span', 'p']
  }
};
