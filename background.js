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

  if (message.action === 'scan_videos') {
    const { tabId } = message;

    if (!tabId) {
      sendResponse({ success: false, error: 'No tabId provided' });
      return true;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tabId, allFrames: true },
        func: () => {
          const result = { videos: [], lectureName: null, courseTitle: null };

          // --- Extract video sources (runs in the s_main / istream frame) ---
          // The two channels always share the same base URL pattern:
          //   lectureStream.php?channel=1  and  lectureStream.php?channel=2
          // So if we find any one source, we can derive both.
          const videos = document.querySelectorAll('video');
          let baseStreamUrl = null;

          videos.forEach(video => {
            const source = video.querySelector('source');
            if (source && source.src) {
              // Extract the base URL (everything before "channel=N")
              const srcUrl = source.src;
              const match = srcUrl.match(/^(.*lectureStream\.php\?channel=)\d+/);
              if (match && !baseStreamUrl) {
                baseStreamUrl = match[1]; // e.g. "https://istream.../lectureStream.php?channel="
              }

              const idMatch = video.id ? video.id.match(/channel(\d+)/) : null;
              const channel = idMatch ? idMatch[1] : null;

              let label = '影片';
              if (channel === '1') label = '講師';
              else if (channel === '2') label = '簡報';
              else if (video.id) label = video.id;

              result.videos.push({
                url: srcUrl,
                id: video.id || null,
                channel: channel,
                label: label,
              });
            }
          });

          // If we found a base URL but only got one video element,
          // guarantee both channels are present
          if (baseStreamUrl) {
            const foundChannels = new Set(result.videos.map(v => v.channel));
            const channelDefs = [
              { channel: '1', label: '講師', id: 'channel1' },
              { channel: '2', label: '簡報', id: 'channel2' },
            ];
            for (const def of channelDefs) {
              if (!foundChannels.has(def.channel)) {
                result.videos.push({
                  url: baseStreamUrl + def.channel,
                  id: def.id,
                  channel: def.channel,
                  label: def.label,
                });
              }
            }
          }

          // --- Extract selected lecture name (runs in the s_catalog frame) ---
          const selectedLi = document.querySelector('li.selected, li. selected');
          if (selectedLi) {
            const anchor = selectedLi.querySelector('a');
            if (anchor) {
              result.lectureName = anchor.textContent.trim();
            }
          }

          // --- Extract course title from page <title> (runs in top frame) ---
          if (document.title && document.title.length > 3) {
            result.courseTitle = document.title.trim();
          }

          return result;
        },
      },
      (results) => {
        if (chrome.runtime.lastError) {
          console.error('[SSO+ BG] scan_videos error:', chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }

        const videos = [];
        let lectureName = null;
        let courseTitle = null;

        if (results) {
          for (const frame of results) {
            if (frame.result) {
              if (Array.isArray(frame.result.videos)) {
                videos.push(...frame.result.videos);
              }
              if (frame.result.lectureName && !lectureName) {
                lectureName = frame.result.lectureName;
              }
              if (frame.result.courseTitle && !courseTitle) {
                courseTitle = frame.result.courseTitle;
              }
            }
          }
        }

        sendResponse({ success: true, videos, lectureName, courseTitle });
      }
    );

    return true;
  }

  if (message.action === 'get_download_progress') {
    const { downloadId } = message;
    chrome.downloads.search({ id: downloadId }, (items) => {
      if (chrome.runtime.lastError || !items || items.length === 0) {
        sendResponse({ success: false });
      } else {
        const item = items[0];
        sendResponse({
          success: true,
          state: item.state,
          bytesReceived: item.bytesReceived,
          totalBytes: item.totalBytes,
          filename: item.filename,
        });
      }
    });
    return true;
  }
});
