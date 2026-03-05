
/**
 * 北科大 SSO+ 檔案下載內容腳本
 *
 * 功能：
 * - 僅在 mooc_sysbar 框架中，於「學習互動區」與「評量區」之間
 *   插入一個新的 section，顯示課程 ID 與檔案下載功能
 * - 從頁面中提取課程 ID（cid，純數字）並顯示於 UI
 * - 點擊「檢索檔案」按鈕後，透過 xmlapi 取得課程教材樹並列出可下載檔案
 */

(function () {
    // ========================
    // Frame guard
    // ========================

    /**
     * Return true only if the current frame is the mooc_sysbar sidebar.
     * This prevents the prompt from appearing in every iStudy sub-frame.
     */
    function isMoocSysbar() {
        if (document.getElementById('moocSidebar')) return true;
        try {
            if (window.location.pathname.includes('mooc_sysbar')) return true;
        } catch { /* cross-origin — not our frame */ }
        return false;
    }

    // ========================
    // CID 擷取
    // ========================

    /** Return true if the value is a purely numeric string. */
    function isNumericCid(val) {
        return /^\d+$/.test(val);
    }

    /**
     * Try multiple strategies to extract the course ID.
     * Only accepts purely numeric cid values.
     */
    function extractCid() {
        // Strategy 1: <a id="SYS_04_01_005" href="…?cid=XXXXX">
        const forumLink = document.getElementById('SYS_04_01_005');
        if (forumLink) {
            const href = forumLink.getAttribute('href') || '';
            const match = href.match(/[?&]cid=(\d+)/);
            if (match) return match[1];
        }

        // Strategy 2: any link whose href contains cid=
        const allLinks = document.querySelectorAll('a[href*="cid="]');
        for (const link of allLinks) {
            const href = link.getAttribute('href') || '';
            const match = href.match(/[?&]cid=(\d+)/);
            if (match) return match[1];
        }

        // Strategy 3: hidden form input named "cid"
        const cidInput = document.querySelector('input[name="cid"]');
        if (cidInput && cidInput.value && isNumericCid(cidInput.value)) {
            return cidInput.value;
        }

        // Strategy 4: URL query string
        const urlParams = new URLSearchParams(window.location.search);
        const cidParam = urlParams.get('cid');
        if (cidParam && isNumericCid(cidParam)) return cidParam;

        // Strategy 5: course dropdown
        const selCourse = document.getElementById('selcourse');
        if (selCourse && selCourse.value && selCourse.value !== '10000000' && isNumericCid(selCourse.value)) {
            return selCourse.value;
        }

        return null;
    }

    // ========================
    // File list fetching & rendering
    // ========================

    function renderFileTree(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return '<span class="ntut-sso-fdl-empty">無檔案</span>';
        }
        return '<ul class="ntut-sso-fdl-file-ul">' + items.map(f => {
            const text = f.title || f.text || '(無標題)';
            const href = f.url || f.link || f.href || f.download_url || '';
            let children = '';
            if (Array.isArray(f.item) && f.item.length > 0) {
                children = renderFileTree(f.item);
            }
            // Only show as clickable link if it's a real downloadable URL
            const isDownloadable = href
                && !href.startsWith('istream')
                && !href.startsWith('about')
                && !href.startsWith('/istream');
            if (isDownloadable) {
                return `<li><a class="ntut-sso-fdl-link" href="${href}" target="_blank" rel="noopener">${text}</a>${children}</li>`;
            }
            return `<li><span class="ntut-sso-fdl-folder">${text}</span>${children}</li>`;
        }).join('') + '</ul>';
    }

    async function fetchFileList(cid, container) {
        container.innerHTML = '<span class="ntut-sso-fdl-loading">載入中…</span>';
        try {
            const apiUrl = `https://istudy.ntut.edu.tw/xmlapi/index.php?action=my-course-path-info&onlyProgress=0&descendant=1&cid=${cid}`;
            const res = await fetch(apiUrl, { credentials: 'include' });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const contentType = res.headers.get('Content-Type') || '';
            if (!contentType.includes('application/json')) {
                const preview = (await res.text()).substring(0, 120);
                throw new Error(`非 JSON 回應: ${preview}`);
            }

            const data = await res.json();
            if (data && data.data) {
                if (data.data.path && Array.isArray(data.data.path.item)) {
                    container.innerHTML = renderFileTree(data.data.path.item);
                } else if (Array.isArray(data.data.list)) {
                    container.innerHTML = renderFileTree(data.data.list);
                } else {
                    container.innerHTML = '<span class="ntut-sso-fdl-empty">此課程無教材檔案</span>';
                }
            } else {
                container.innerHTML = '<span class="ntut-sso-fdl-empty">無法取得檔案清單</span>';
            }
        } catch (err) {
            console.error('[SSO+ FDL] Fetch error:', err);
            container.innerHTML = `<span class="ntut-sso-fdl-error">取得檔案失敗：${err.message}</span>`;
        }
    }

    // ========================
    // UI injection (inline section in mooc_sysbar)
    // ========================

    /**
     * Find the section containing the given h2 id.
     * Sections in mooc_sysbar are <div class="section"> with an <h2> child.
     */
    function findSectionByH2Id(h2Id) {
        const h2 = document.getElementById(h2Id);
        if (!h2) return null;
        // Walk up to the parent .section div
        return h2.closest('.section') || h2.parentElement;
    }

    function injectFileDownloadSection() {
        // Avoid double-injection
        if (document.getElementById('ntut-sso-fdl-section')) return;

        // Only inject in the mooc_sysbar frame
        if (!isMoocSysbar()) return;

        const cid = extractCid();
        if (!cid) return;

        // Find the anchor sections
        const learnSection = findSectionByH2Id('SYS_04_01_000'); // 學習互動區
        const assessSection = findSectionByH2Id('SYS_04_02_000'); // 評量區

        // We need at least the 評量區 section to insert before it,
        // or the 學習互動區 section to insert after it.
        if (!assessSection && !learnSection) return;

        // ── Build the new section ──
        const section = document.createElement('div');
        section.className = 'section';
        section.id = 'ntut-sso-fdl-section';

        // Header row: title + cid badge + status badge
        const header = document.createElement('h2');
        header.id = 'ntut-sso-fdl-header';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'ntut-sso-fdl-title';
        titleSpan.textContent = '檔案下載';
        header.appendChild(titleSpan);

        const cidBadge = document.createElement('span');
        cidBadge.className = 'ntut-sso-fdl-badge';
        cidBadge.textContent = `cid: ${cid}`;
        cidBadge.title = '課程 ID';
        header.appendChild(cidBadge);

        const statusBadge = document.createElement('span');
        statusBadge.className = 'ntut-sso-fdl-badge ntut-sso-fdl-status';
        statusBadge.textContent = '點擊載入';
        header.appendChild(statusBadge);

        section.appendChild(header);

        // File list container (hidden until fetched)
        const fileListContainer = document.createElement('div');
        fileListContainer.className = 'ntut-sso-fdl-file-list';
        fileListContainer.id = 'ntut-sso-fdl-file-list';
        section.appendChild(fileListContainer);

        // Click the h2 header to fetch
        let hasFetched = false;
        header.style.cursor = 'pointer';
        header.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (hasFetched) return;
            hasFetched = true;
            statusBadge.textContent = '載入中…';
            statusBadge.classList.add('ntut-sso-fdl-status--loading');
            fetchFileList(cid, fileListContainer).then(() => {
                statusBadge.textContent = '已載入';
                statusBadge.classList.remove('ntut-sso-fdl-status--loading');
                statusBadge.classList.add('ntut-sso-fdl-status--done');
            });
        });

        // ── Insert the section between 學習互動區 and 評量區 ──
        if (assessSection) {
            assessSection.parentNode.insertBefore(section, assessSection);
        } else if (learnSection && learnSection.nextSibling) {
            learnSection.parentNode.insertBefore(section, learnSection.nextSibling);
        } else if (learnSection) {
            learnSection.parentNode.appendChild(section);
        }
    }

    // ========================
    // Initialisation
    // ========================

    /**
     * When the user switches courses, mooc_sysbar's parseSysbar() removes
     * ALL .section children and rebuilds them from AJAX.  Our injected
     * section gets destroyed in the process.
     *
     * To handle this we keep a MutationObserver running permanently.
     * On every DOM mutation within #moocSidebar we check whether our
     * section still exists — if not, we re-inject it (with the new cid).
     */
    function init() {
        if (!isMoocSysbar()) return;

        // Try the first injection immediately
        injectFileDownloadSection();

        // Observe the sidebar for rebuilds (course switching)
        const sidebar = document.getElementById('moocSidebar');
        const observeTarget = sidebar || document.body || document.documentElement;

        const observer = new MutationObserver(() => {
            // Our section was removed (course switch) or never injected yet
            if (!document.getElementById('ntut-sso-fdl-section')) {
                injectFileDownloadSection();
            }
        });

        observer.observe(observeTarget, {
            childList: true,
            subtree: true,
        });
        // No timeout — keep observing for the lifetime of the frame
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
