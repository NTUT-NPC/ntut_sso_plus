export default defineBackground(() => {
    let activeDownloads: Record<number, boolean> = {};

    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

    browser.downloads.onChanged.addListener((delta) => {
        if (!delta || !delta.id || !activeDownloads[delta.id]) return;

        let status = null;
        let progress = null;

        if (delta.state && delta.state.current) {
            status = delta.state.current;
        }
        if (delta.bytesReceived && delta.totalBytes) {
            progress = Math.floor((delta.bytesReceived.current / delta.totalBytes.current) * 100);
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
