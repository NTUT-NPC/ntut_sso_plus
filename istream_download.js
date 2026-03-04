/**
 * iStream Video Download - Content Script
 * Injects download buttons into the iStream video player on istream.ntut.edu.tw
 * Runs in all frames (including the s_main frame where the video player lives).
 */

(function () {
  'use strict';

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
    let lectureName = '';
    let courseTitle = '';

    // Try to find selected lecture name from the s_catalog sidebar frame
    // (may be in a sibling frame — try parent.s_catalog or top-level traversal)
    try {
      const catalogFrame = window.parent?.frames?.s_catalog || window.top?.frames?.s_catalog;
      if (catalogFrame && catalogFrame.document) {
        const selectedLi = catalogFrame.document.querySelector('li.selected, li. selected');
        if (selectedLi) {
          const anchor = selectedLi.querySelector('a');
          if (anchor) lectureName = anchor.textContent.trim();
        }
      }
    } catch (e) {
      // Cross-origin — can't access sibling frame
    }

    // Try the page <title> from the top frame for the course name
    try {
      const topTitle = window.top?.document?.title || '';
      if (topTitle.length > 3) {
        courseTitle = topTitle.replace(/\s*-\s*臺北科技大學.*$/i, '').trim();
      }
    } catch (e) {
      // Cross-origin
    }

    // Fallback: try this frame's own <title> or common selectors
    if (!lectureName && !courseTitle) {
      const titleEl =
        document.querySelector('title') ||
        document.querySelector('.lecture-title') ||
        document.querySelector('#lecture_title');
      if (titleEl) courseTitle = titleEl.textContent.trim();
    }

    let parts = [];
    if (courseTitle) parts.push(courseTitle);
    if (lectureName) parts.push(lectureName);
    let base = parts.join('_') || 'istream_video';

    // Sanitise
    base = base.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').substring(0, 120);

    return `${base}_${channelLabel}.mp4`;
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

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const filename = buildFilename(ch.label);

        chrome.runtime.sendMessage(
          {
            action: 'download_video',
            url: videoUrl,
            filename: filename,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('[SSO+ DL]', chrome.runtime.lastError.message);
              window.open(videoUrl, '_blank');
              return;
            }
            if (response && response.success) {
              btn.classList.add('ntut-sso-dl-btn--started');
              btn.textContent = '下載中…';
              setTimeout(() => {
                btn.classList.remove('ntut-sso-dl-btn--started');
                btn.textContent = ch.label;
              }, 3000);
            } else {
              window.open(videoUrl, '_blank');
            }
          }
        );
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
