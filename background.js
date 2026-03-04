/**
 * Background service worker for 北科大 SSO+
 *
 * Handles:
 * - Video download requests from the iStream content script & popup
 * - Scanning tabs for video sources via chrome.scripting
 * - Download progress tracking
 */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'download_video') {
    const { url, filename } = message;

    if (!url) {
      sendResponse({ success: false, error: 'No URL provided' });
      return true;
    }

    chrome.downloads.download(
      {
        url: url,
        filename: filename || 'istream_video.mp4',
        conflictAction: 'uniquify',
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error('[SSO+ BG]', chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log('[SSO+ BG] Download started, id:', downloadId);
          sendResponse({ success: true, downloadId });
        }
      }
    );

    return true;
  }
});
