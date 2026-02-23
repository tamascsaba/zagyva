/**
 * YouTube site configuration.
 * Video cards, shelf items, search results, recommendations.
 */

var HE_Sites = HE_Sites || {};

HE_Sites.youtube = {
  id: 'youtube',
  hostnames: ['www.youtube.com', 'youtube.com', 'm.youtube.com'],
  selectors: {
    articleContainers: [
      'ytd-rich-item-renderer',
      'ytd-video-renderer',
      'ytd-compact-video-renderer',
      'ytd-video-with-context-renderer',
      'ytd-grid-video-renderer',
      'ytd-playlist-video-renderer',
      'ytd-reel-item-renderer',
      'ytd-reel-shelf-renderer',
      'ytd-rich-section-renderer',
      'ytd-shelf-renderer',
      'ytm-shorts-lockup-view-model',
      'ytm-rich-item-renderer',
      '[is-shorts]',
      'ytd-reel-video-renderer'
    ],
    textElements: [
      '#video-title',
      '#channel-name',
      '.ytd-channel-name',
      'h3',
      '.metadata',
      'yt-formatted-string',
      '[class*="shortsLockupView"]',
      '[class*="reel-item"]',
      'span[id="video-title"]',
      'a#video-title-link'
    ]
  }
};
