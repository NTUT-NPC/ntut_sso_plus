export default defineBackground(() => {
    let activeDownloads: Record<number, boolean> = {};

    interface DownloadMessage {
        action: string;
        url?: string;
        filename?: string;
    }

    browser.runtime.onMessage.addListener((message: DownloadMessage, sender, sendResponse) => {
        if (message.action === 'download_video') {
            const { url, filename } = message;

            if (!url) {
                sendResponse({ success: false, error: 'No URL provided' });
                return true;
            }

            browser.downloads.download(
                {
                    url: url,
                    filename: filename || 'istream_video.mp4',
                    conflictAction: 'uniquify',
                },
            ).then((downloadId) => {
                console.log('[SSO+ BG] Download started, id:', downloadId);
                activeDownloads[downloadId] = true;
                sendResponse({ success: true, downloadId });
            }).catch((error) => {
                console.error('[SSO+ BG]', error.message);
                sendResponse({ success: false, error: error.message });
            });

            return true;
        }
    });

    browser.downloads.onChanged.addListener(async (delta) => {
        if (!delta || !delta.id || !activeDownloads[delta.id]) return;

        // Fetch the full DownloadItem to get current progress
        const [item] = await browser.downloads.search({ id: delta.id });
        if (!item) return;

        let status = delta.state?.current || item.state;
        let progress = null;

        if (item.totalBytes > 0) {
            progress = Math.floor((item.bytesReceived / item.totalBytes) * 100);
        }

        browser.runtime.sendMessage({
            action: 'download_progress',
            downloadId: delta.id,
            status,
            progress,
        }).catch(() => {
            // Ignore errors when sending progress (e.g. popup closed)
        });

        if (status === 'complete' || status === 'interrupted') {
            delete activeDownloads[delta.id];
        }
    });
});
