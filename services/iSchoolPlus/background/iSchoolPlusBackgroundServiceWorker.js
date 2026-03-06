/**
 * Background service worker for 北科大 SSO+
 *
 * Handles:
 * - Video download requests from the iStream content script & popup
 * - Scanning tabs for video sources via chrome.scripting
 * - Download progress tracking
 */

let activeDownloads = {};

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
          activeDownloads[downloadId] = true;
          sendResponse({ success: true, downloadId });
        }
      }
    );

    return true;
  }
});

chrome.downloads.onChanged.addListener((delta) => {
  if (!delta || !delta.id || !activeDownloads[delta.id]) return;

  let status = null;
  let progress = null;

  if (delta.state && delta.state.current) {
    status = delta.state.current;
  }
  if (delta.bytesReceived && delta.totalBytes) {
    progress = Math.floor((delta.bytesReceived / delta.totalBytes) * 100);
  }

  chrome.runtime.sendMessage({
    action: 'download_progress',
    downloadId: delta.id,
    status,
    progress,
  });

  if (status === 'complete' || status === 'interrupted') {
    delete activeDownloads[delta.id];
  }
});
