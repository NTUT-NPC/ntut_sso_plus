import './file-download.css';

export default defineContentScript({
    matches: ['https://istudy.ntut.edu.tw/*'],
    allFrames: true,
    runAt: 'document_idle',
    main() {
        function isMoocSysbar() {
            if (document.getElementById('moocSidebar')) return true;
            try {
                if (window.location.pathname.includes('mooc_sysbar')) return true;
            } catch {
                /* cross-origin — not our frame */
            }
            return false;
        }

        function isNumericCid(val: string) {
            return /^\d+$/.test(val);
        }

        function extractCid() {
            const forumLink = document.getElementById('SYS_04_01_005');
            if (forumLink) {
                const href = forumLink.getAttribute('href') || '';
                const match = href.match(/[?&]cid=(\d+)/);
                if (match) return match[1];
            }

            const allLinks = document.querySelectorAll('a[href*="cid="]');
            for (const link of allLinks) {
                const href = link.getAttribute('href') || '';
                const match = href.match(/[?&]cid=(\d+)/);
                if (match) return match[1];
            }

            const cidInput = document.querySelector('input[name="cid"]') as HTMLInputElement;
            if (cidInput && cidInput.value && isNumericCid(cidInput.value)) {
                return cidInput.value;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const cidParam = urlParams.get('cid');
            if (cidParam && isNumericCid(cidParam)) return cidParam;

            const selCourse = document.getElementById('selcourse') as HTMLSelectElement;
            if (
                selCourse &&
                selCourse.value &&
                selCourse.value !== '10000000' &&
                isNumericCid(selCourse.value)
            ) {
                return selCourse.value;
            }

            return null;
        }

        interface FileItem {
            title?: string;
            text?: string;
            url?: string;
            link?: string;
            href?: string;
            download_url?: string;
            item?: FileItem[];
            [key: string]: any;
        }

        function renderFileTree(items: FileItem[]): HTMLElement {
            if (!Array.isArray(items) || items.length === 0) {
                const emptySpan = document.createElement('span');
                emptySpan.className = 'ntut-sso-fdl-empty';
                emptySpan.textContent = '無檔案';
                return emptySpan;
            }

            const ul = document.createElement('ul');
            ul.className = 'ntut-sso-fdl-file-ul';

            items.forEach((f) => {
                const li = document.createElement('li');
                const text = f.title || f.text || '(無標題)';
                const href = f.url || f.link || f.href || f.download_url || '';

                const isDownloadable =
                    href &&
                    !href.startsWith('istream') &&
                    !href.startsWith('about') &&
                    !href.startsWith('/istream');

                if (isDownloadable) {
                    const a = document.createElement('a');
                    a.className = 'ntut-sso-fdl-link';
                    a.href = href;
                    a.target = '_blank';
                    a.rel = 'noopener';
                    a.textContent = text;
                    li.appendChild(a);
                } else {
                    const span = document.createElement('span');
                    span.className = 'ntut-sso-fdl-folder';
                    span.textContent = text;
                    li.appendChild(span);
                }

                if (Array.isArray(f.item) && f.item.length > 0) {
                    li.appendChild(renderFileTree(f.item));
                }
                ul.appendChild(li);
            });

            return ul;
        }

        async function fetchFileList(cid: string, container: HTMLElement) {
            const loadingSpan = document.createElement('span');
            loadingSpan.className = 'ntut-sso-fdl-loading';
            loadingSpan.textContent = '載入中…';
            container.replaceChildren(loadingSpan);

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
                        container.replaceChildren(renderFileTree(data.data.path.item));
                    } else if (Array.isArray(data.data.list)) {
                        container.replaceChildren(renderFileTree(data.data.list));
                    } else {
                        const emptySpan = document.createElement('span');
                        emptySpan.className = 'ntut-sso-fdl-empty';
                        emptySpan.textContent = '此課程無教材檔案';
                        container.replaceChildren(emptySpan);
                    }
                } else {
                    const emptySpan = document.createElement('span');
                    emptySpan.className = 'ntut-sso-fdl-empty';
                    emptySpan.textContent = '無法取得檔案清單';
                    container.replaceChildren(emptySpan);
                }
            } catch (err: any) {
                console.error('[SSO+ FDL] Fetch error:', err);
                const errorSpan = document.createElement('span');
                errorSpan.className = 'ntut-sso-fdl-error';
                errorSpan.textContent = `取得檔案失敗：${err.message}`;
                container.replaceChildren(errorSpan);
            }
        }

        function findSectionByH2Id(h2Id: string) {
            const h2 = document.getElementById(h2Id);
            if (!h2) return null;
            return h2.closest('.section') || h2.parentElement;
        }

        function injectFileDownloadSection() {
            if (document.getElementById('ntut-sso-fdl-section')) return;

            if (!isMoocSysbar()) return;

            const cid = extractCid();
            if (!cid) return;

            const learnSection = findSectionByH2Id('SYS_04_01_000');
            const assessSection = findSectionByH2Id('SYS_04_02_000');

            if (!assessSection && !learnSection) return;

            const section = document.createElement('div');
            section.className = 'section';
            section.id = 'ntut-sso-fdl-section';

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

            const fileListContainer = document.createElement('div');
            fileListContainer.className = 'ntut-sso-fdl-file-list';
            fileListContainer.id = 'ntut-sso-fdl-file-list';
            section.appendChild(fileListContainer);

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

            if (assessSection) {
                assessSection.parentNode!.insertBefore(section, assessSection);
            } else if (learnSection && learnSection.nextSibling) {
                learnSection.parentNode!.insertBefore(section, learnSection.nextSibling);
            } else if (learnSection) {
                learnSection.parentNode!.appendChild(section);
            }
        }

        function init() {
            if (!isMoocSysbar()) return;

            injectFileDownloadSection();

            const sidebar = document.getElementById('moocSidebar');
            const observeTarget = sidebar || document.body || document.documentElement;

            const observer = new MutationObserver(() => {
                if (!document.getElementById('ntut-sso-fdl-section')) {
                    injectFileDownloadSection();
                }
            });

            observer.observe(observeTarget, {
                childList: true,
                subtree: true,
            });
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    },
});
