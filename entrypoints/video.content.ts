import './video-download.css';

export default defineContentScript({
    matches: [
        'https://istream.ntut.edu.tw/*',
        'https://istudy.ntut.edu.tw/*',
    ],
    allFrames: true,
    matchAboutBlank: true,
    runAt: 'document_start',
    main() {
        // Fix for "Permission denied to access property 'document' on cross-origin object"
        try {
            (document as any).domain = 'ntut.edu.tw';
        } catch (e) {
            console.warn('[SSO+] Failed to set document.domain:', e);
        }

        function resolveVideoUrl(src: string | null) {
            if (!src) return null;
            try {
                return new URL(src, window.location.href).href;
            } catch {
                return null;
            }
        }

        async function buildFilename(channelLabel: string) {
            const storage = await browser.storage.local.get('activeVideoTitle');
            const rawTitle = storage.activeVideoTitle as string;
            
            if (rawTitle) {
                // Remove illegal filename characters and trim
                const safeTitle = rawTitle.replace(/[\\/:*?"<>|]/g, '_').trim();
                return `${safeTitle}_${channelLabel}.mp4`;
            }
            return `istream_video_${channelLabel}.mp4`;
        }

        function makeDraggable(el: HTMLElement, handle: HTMLElement) {
            let startX: number, startY: number, initLeft: number, initTop: number;

            function onStart(e: MouseEvent | TouchEvent) {
                if ((e.target as HTMLElement).closest('.ntut-sso-dl-btn')) return;

                e.preventDefault();
                const evt = 'touches' in e ? e.touches[0] : e;
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

            function onMove(e: MouseEvent | TouchEvent) {
                e.preventDefault();
                const evt = 'touches' in e ? e.touches[0] : (e as MouseEvent);
                let newLeft = initLeft + (evt.clientX - startX);
                let newTop = initTop + (evt.clientY - startY);

                const maxX = window.innerWidth - el.offsetWidth;
                const maxY = window.innerHeight - el.offsetHeight;
                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));

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

        function injectDownloadBar() {
            if (document.getElementById('ntut-sso-dl-bar')) return;

            const videoPlayer = document.getElementById('videoplayer');
            if (!videoPlayer) return;

            const controller = document.getElementById('video_controller');
            if (!controller) return;

            let baseStreamUrl: string | null = null;
            const allSources = videoPlayer.querySelectorAll('video source');

            allSources.forEach(source => {
                const src = source.getAttribute('src') || '';
                const match = src.match(/^(.*lectureStream\.php\?channel=)\d+/);
                if (match && !baseStreamUrl) {
                    baseStreamUrl = match[1];
                }
            });

            if (!baseStreamUrl) {
                allSources.forEach(source => {
                    const src = (source as HTMLSourceElement).src;
                    if (src) {
                        const match = src.match(/^(.*lectureStream\.php\?channel=)\d+/);
                        if (match && !baseStreamUrl) {
                            baseStreamUrl = match[1];
                        }
                    }
                });
            }

            if (!baseStreamUrl) {
                const anySrc = videoPlayer.querySelector('video source');
                if (anySrc) {
                    const resolved = resolveVideoUrl(anySrc.getAttribute('src'));
                    if (resolved) {
                        const match = resolved.match(/^(.*lectureStream\.php\?channel=)\d+/);
                        if (match) baseStreamUrl = match[1];
                    }
                }
            }

            if (!baseStreamUrl) return;

            const bar = document.createElement('div');
            bar.id = 'ntut-sso-dl-bar';

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

            const btnRow = document.createElement('div');
            btnRow.className = 'ntut-sso-dl-btns';

            const channels = [
                { channel: '1', label: '講師' },
                { channel: '2', label: '簡報' },
            ];

            channels.forEach(ch => {
                const videoUrl = resolveVideoUrl(baseStreamUrl! + ch.channel);
                if (!videoUrl) return;

                const btn = document.createElement('button');
                btn.className = 'ntut-sso-dl-btn';
                btn.title = `下載${ch.label}`;
                btn.textContent = ch.label;

                let currentDownloadId: number | null = null;
                let isDownloading = false;

                btn.addEventListener('click', async (e) => {
                    if (isDownloading) return;
                    e.preventDefault();
                    e.stopPropagation();
 
                    const filename = await buildFilename(ch.label);
                    const fallbackTab = window.open(videoUrl, '_blank');

                    isDownloading = true;
                    btn.classList.add('ntut-sso-dl-btn--started');
                    btn.textContent = '已送出下載請求';
                    btn.disabled = true;

                    browser.runtime.sendMessage({
                        action: 'download_video',
                        url: videoUrl,
                        filename: filename,
                    }).then((response) => {
                        if (!(response && response.success)) {
                            throw new Error(response?.error || 'Download failed');
                        }
                        currentDownloadId = response.downloadId;
                        setTimeout(() => {
                            try { if (fallbackTab) fallbackTab.close(); } catch { }
                        }, 1200);
                    }).catch((err) => {
                        console.error('[SSO+ DL]', err.message);
                        if (fallbackTab) fallbackTab.location.href = videoUrl;
                        btn.textContent = '下載失敗';
                        setTimeout(() => {
                            btn.classList.remove('ntut-sso-dl-btn--started');
                            btn.textContent = ch.label;
                            btn.disabled = false;
                            currentDownloadId = null;
                            isDownloading = false;
                        }, 2000);
                    });
                });

                interface ProgressMessage {
                    action: string;
                    downloadId: number;
                    status: string;
                    progress?: number;
                }

                browser.runtime.onMessage.addListener((msg: ProgressMessage) => {
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
                        } else if (msg.status === 'interrupted' || msg.status === 'cancelled') {
                            btn.textContent = msg.status === 'cancelled' ? '下載已取消' : '下載失敗';
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
            document.body.appendChild(bar);
            makeDraggable(bar, bar);
        }


        function init() {
            // Logic for Player Frame (istream)
            injectDownloadBar();
            
            // Logic for Catalog Frame (istudy)
            // This script runs in all frames. We check for the catalog's unique elements.
            const syncActiveTitle = () => {
                const selectedLi = document.querySelector('li.selected');
                if (selectedLi) {
                    const titleLink = selectedLi.querySelector('.cssAnchor1');
                    const titleText = titleLink?.getAttribute('title') || titleLink?.textContent?.trim();
                    if (titleText) {
                        browser.storage.local.set({ activeVideoTitle: titleText });
                    }
                }
            };

            // Initial sync
            syncActiveTitle();

            // Monitor for changes in the catalog (e.g. user clicks another video)
            const observer = new MutationObserver(() => {
                if (document.getElementById('videoplayer')) {
                    injectDownloadBar();
                }
                syncActiveTitle();
            });

            observer.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class'] // Watch for 'selected' class changes
            });

            if (!document.getElementById('ntut-sso-dl-bar')) {
                setTimeout(() => {
                    if (!document.getElementById('ntut-sso-dl-bar') && document.getElementById('videoplayer')) {
                        injectDownloadBar();
                    }
                }, 1000);
                
                setTimeout(() => observer.disconnect(), 60000);
            }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    },
});
