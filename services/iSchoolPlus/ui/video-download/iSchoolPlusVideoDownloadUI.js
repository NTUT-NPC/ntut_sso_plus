
/**
 * 北科大 SSO+ 影片下載內容腳本
 *
 * 功能：
 * - 在 istream.ntut.edu.tw 影片播放器下方注入「下載」按鈕
 * - 支援多頻道（講師/簡報）影片下載
 * - 按下下載按鈕時：
 *   1. 送出下載請求給背景 Service Worker，使用 chrome.downloads API 下載影片
 *   2. 開啟一個新分頁作為「下載請求已送出」的回饋頁（建議使用 HTTPS 靜態網站以避免被 Brave 等瀏覽器阻擋）
 *   3. 按鈕顯示進度、完成、失敗、取消等狀態，並防止重複點擊
 * - 支援拖曳浮動下載工具列
 *
 * 注意事項：
 * - 若使用 Brave 或隱私擴充功能，chrome-extension:// 分頁可能被阻擋，建議改用 HTTPS 網站作為回饋頁
 * - 下載速度取決於伺服器回應，可能有延遲
 */

(function () {
  // ========================
  // 工具函式區
  // ========================

  // --- Helpers -----------------------------------------------------------

  /**
   * Resolve a relative video source path to an absolute URL based on the
   * current page location (works correctly inside the frame).
   */
  function resolveVideoUrl(src) {
    if (!src) return null;
    try {
      return new URL(src, window.location.href).href;
    } catch {
      return null;
    }
  }

  /**
   * Try to extract a human-readable filename from the page / URL.
   * Falls back to a channel label.
   */
  function buildFilename(channelLabel) {
    return `istream_video_${channelLabel}.mp4`;
  }

  // --- Draggable helper ---------------------------------------------------

  /**
   * Make an element draggable by a handle.  Works with both mouse and touch.
   * Clamps the element within the viewport so it can't be dragged off-screen.
   */
  function makeDraggable(el, handle) {
    let startX, startY, initLeft, initTop;

    function onStart(e) {
      // Ignore clicks on buttons inside the bar
      if (e.target.closest('.ntut-sso-dl-btn')) return;

      e.preventDefault();
      const evt = e.touches ? e.touches[0] : e;
      startX = evt.clientX;
      startY = evt.clientY;

      const rect = el.getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;

      el.classList.add('ntut-sso-dl-bar--dragging');
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }

    function onMove(e) {
      e.preventDefault();
      const evt = e.touches ? e.touches[0] : e;
      let newLeft = initLeft + (evt.clientX - startX);
      let newTop = initTop + (evt.clientY - startY);

      // Clamp within viewport
      const maxX = window.innerWidth - el.offsetWidth;
      const maxY = window.innerHeight - el.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxX));
      newTop = Math.max(0, Math.min(newTop, maxY));

      // Switch from bottom-anchored to top/left positioning while dragging
      el.style.bottom = 'auto';
      el.style.right = 'auto';
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    }

    function onEnd() {
      el.classList.remove('ntut-sso-dl-bar--dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    }

    handle.addEventListener('mousedown', onStart);
    handle.addEventListener('touchstart', onStart, { passive: false });
  }

  // --- Button injection ---------------------------------------------------

  function injectDownloadBar() {
    // Avoid double-injection
    if (document.getElementById('ntut-sso-dl-bar')) return;

    const videoPlayer = document.getElementById('videoplayer');
    if (!videoPlayer) return; // Not the right frame / page

    const controller = document.getElementById('video_controller');
    if (!controller) return;

    // The two channels always share the same base URL pattern:
    //   lectureStream.php?channel=1  (講師)
    //   lectureStream.php?channel=2  (簡報)
    // If we find any source, derive both URLs for consistency.
    let baseStreamUrl = null;

    const allSources = videoPlayer.querySelectorAll('video source');
    allSources.forEach(source => {
      const src = source.getAttribute('src') || '';
      const match = src.match(/^(.*lectureStream\.php\?channel=)\d+/);
      if (match && !baseStreamUrl) {
        baseStreamUrl = match[1];
      }
    });

    // If no source found via attribute, try resolved src property
    if (!baseStreamUrl) {
      allSources.forEach(source => {
        if (source.src) {
          const match = source.src.match(/^(.*lectureStream\.php\?channel=)\d+/);
          if (match && !baseStreamUrl) {
            baseStreamUrl = match[1];
          }
        }
      });
    }

    if (!baseStreamUrl) {
      // Fallback: try resolving relative URL from a known source element
      const anySrc = videoPlayer.querySelector('video source');
      if (anySrc) {
        const resolved = resolveVideoUrl(anySrc.getAttribute('src'));
        if (resolved) {
          const match = resolved.match(/^(.*lectureStream\.php\?channel=)\d+/);
          if (match) baseStreamUrl = match[1];
        }
      }
    }

    if (!baseStreamUrl) return; // No video sources found at all

    const bar = document.createElement('div');
    bar.id = 'ntut-sso-dl-bar';

    // Top row: label + hint
    const topRow = document.createElement('div');
    topRow.className = 'ntut-sso-dl-top';

    const label = document.createElement('span');
    label.className = 'ntut-sso-dl-label';
    label.textContent = '下載影片';
    topRow.appendChild(label);

    const hint = document.createElement('span');
    hint.className = 'ntut-sso-dl-hint';
    hint.textContent = '請先播放影片再下載';
    topRow.appendChild(hint);

    bar.appendChild(topRow);

    // Bottom row: buttons
    const btnRow = document.createElement('div');
    btnRow.className = 'ntut-sso-dl-btns';

    const channels = [
      { channel: '1', label: '講師' },
      { channel: '2', label: '簡報' },
    ];

    channels.forEach(ch => {
      const videoUrl = resolveVideoUrl(baseStreamUrl + ch.channel);
      if (!videoUrl) return;

      const btn = document.createElement('button');
      btn.className = 'ntut-sso-dl-btn';
      btn.title = `下載${ch.label}`;
      btn.textContent = ch.label;

      let currentDownloadId = null;
      let isDownloading = false;

      btn.addEventListener('click', (e) => {
        if (isDownloading) return;
        e.preventDefault();
        e.stopPropagation();

        const filename = buildFilename(ch.label);
        const fallbackTab = window.open(videoUrl, '_blank');

        isDownloading = true;
        btn.classList.add('ntut-sso-dl-btn--started');
        btn.textContent = '已送出下載請求';
        btn.disabled = true;

        chrome.runtime.sendMessage(
          {
            action: 'download_video',
            url: videoUrl,
            filename: filename,
          },
          (response) => {
            if (chrome.runtime.lastError || !(response && response.success)) {
              console.error('[SSO+ DL]', chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Download failed');
              if (fallbackTab) fallbackTab.location = videoUrl;
              btn.textContent = '下載失敗';
              setTimeout(() => {
                btn.classList.remove('ntut-sso-dl-btn--started');
                btn.textContent = ch.label;
                btn.disabled = false;
                currentDownloadId = null;
                isDownloading = false;
              }, 2000);
              return;
            }
            // Download succeeded, close the fallback tab after a short delay
            currentDownloadId = response.downloadId;
            setTimeout(() => {
              try { if (fallbackTab) fallbackTab.close(); } catch {}
            }, 1200);
          }
        );
      });

      // Listen for download progress messages from background
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.action === 'download_progress' && msg.downloadId === currentDownloadId) {
          if (msg.status === 'in_progress' && typeof msg.progress === 'number') {
            btn.textContent = `下載中… ${msg.progress}%`;
          } else if (msg.status === 'complete') {
            btn.textContent = '下載完成';
            setTimeout(() => {
              btn.classList.remove('ntut-sso-dl-btn--started');
              btn.textContent = ch.label;
              btn.disabled = false;
              currentDownloadId = null;
              isDownloading = false;
            }, 2000);
          } else if (msg.status === 'interrupted') {
            btn.textContent = '下載失敗';
            setTimeout(() => {
              btn.classList.remove('ntut-sso-dl-btn--started');
              btn.textContent = ch.label;
              btn.disabled = false;
              currentDownloadId = null;
              isDownloading = false;
            }, 2000);
          } else if (msg.status === 'cancelled') {
            btn.textContent = '下載已取消';
            setTimeout(() => {
              btn.classList.remove('ntut-sso-dl-btn--started');
              btn.textContent = ch.label;
              btn.disabled = false;
              currentDownloadId = null;
              isDownloading = false;
            }, 2000);
          }
        }
      });

      btnRow.appendChild(btn);
    });

    bar.appendChild(btnRow);

    // Append the floating bar to <body> so it's outside #videoplayer
    // and won't be clipped by overflow:hidden.
    document.body.appendChild(bar);

    // --- Draggable behaviour (vanilla JS) --------------------------------
    // The entire bar is the drag handle (buttons are excluded in onStart)
    makeDraggable(bar, bar);
  }

  // --- Initialisation -----------------------------------------------------

  /**
   * The video player DOM may be rendered dynamically, so we use a
   * MutationObserver as a fallback in addition to direct injection.
   */
  function init() {
    injectDownloadBar();

    // If the player wasn't found yet, observe for DOM changes
    if (!document.getElementById('ntut-sso-dl-bar')) {
      const observer = new MutationObserver(() => {
        if (document.getElementById('videoplayer')) {
          injectDownloadBar();
          if (document.getElementById('ntut-sso-dl-bar')) {
            observer.disconnect();
          }
        }
      });
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
      });

      // Safety: stop observing after 30 s to avoid leaks
      setTimeout(() => observer.disconnect(), 30000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
