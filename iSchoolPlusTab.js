// iStudyTab.js
// Handles the UI and logic for the '其他' tab in the popup
import { silentLoginAndGetJson } from "./iSchoolPlus/iSchoolPlusAPI.js";

/** Escape a string for safe interpolation into HTML markup. */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export async function loadOtherTabCourses() {
    const otherTab = document.getElementById('tab-other');
    otherTab.innerHTML = '<div class="istudy-loading">載入中...</div>';
    try {
        const res = await fetch('https://istudy.ntut.edu.tw/xmlapi/index.php?action=my-course-list');
        const data = await res.json();
        if (data.code === 0 && data.data && Array.isArray(data.data.list)) {
            const list = data.data.list.map(item => {
                const safeId = escapeHtml(item.course_id);
                const safeTitle = escapeHtml(item.title);
                const divId = `course-${safeId}`;
                const btnId = `scan-btn-${safeId}`;
                return `<div class="istudy-course-block">
                    <div class="istudy-course-row">
                        <span class="istudy-course-title">${safeTitle}</span>
                        <button class="istudy-scan-btn" id="${btnId}" data-cid="${safeId}">檢索檔案</button>
                    </div>
                    <div class="istudy-file-list" id="file-list-${safeId}">
                        <span class="istudy-empty">點擊「檢索檔案」以取得內容</span>
                    </div>
                </div>`;
            }).join('');
            otherTab.innerHTML = `<div class="istudy-course-grid">${list}</div>`;

            // Recursive file rendering function
            function renderFileItems(items) {
                if (!Array.isArray(items) || items.length === 0) {
                    return '<span class="istudy-empty">無檔案</span>';
                }
                return '<ul class="istudy-file-ul">' + items.map(f => {
                    const rawText = f.title || f.text || JSON.stringify(f);
                    const safeText = escapeHtml(rawText);
                    const href = f.url || f.link || f.href || f.download_url || '';
                    let children = '';
                    if (Array.isArray(f.item) && f.item.length > 0) {
                        children = renderFileItems(f.item);
                    }
                    if (href && href !== 'about:blank' && !href.startsWith('istream')) {
                        return `<li><a href="#" class="file-download-link istudy-file-link" data-href="${encodeURIComponent(href)}" data-filename="${encodeURIComponent(rawText)}">${safeText}</a>${children}</li>`;
                    } else {
                        return `<li>${safeText}${children}</li>`;
                    }
                }).join('') + '</ul>';
            }

            // Add event listeners for each button
            data.data.list.forEach(item => {
                const btn = document.getElementById(`scan-btn-${item.course_id}`);
                btn.addEventListener('click', async () => {
                    const fileDiv = document.getElementById(`file-list-${item.course_id}`);
                    fileDiv.innerHTML = '載入中...';
                    try {
                        const result = await silentLoginAndGetJson(item.course_id);
                        if (result && result.data) {
                            let fileHtml = '';
                            if (result.data.path && Array.isArray(result.data.path.item)) {
                                fileHtml = renderFileItems(result.data.path.item);
                            } else if (Array.isArray(result.data.list)) {
                                fileHtml = renderFileItems(result.data.list);
                            } else {
                                fileHtml = '<span class="istudy-empty">無檔案</span>';
                            }
                            fileDiv.innerHTML = fileHtml;
                        } else {
                            fileDiv.innerHTML = '<span class="istudy-error">無法取得檔案清單</span>';
                        }
                    } catch (e) {
                        fileDiv.innerHTML = '<span class="istudy-error">API 請求失敗</span>';
                    }
                    // Add click handler for download links
                    fileDiv.querySelectorAll('.file-download-link').forEach(link => {
                        link.addEventListener('click', function (e) {
                            e.preventDefault();
                            const url = decodeURIComponent(this.getAttribute('data-href'));
                            window.open(url, '_blank');
                        });
                    });
                });
            });
        } else {
            otherTab.innerHTML = '<div class="istudy-error">無法取得課程資料</div>';
        }
    } catch (e) {
        otherTab.innerHTML = '<div class="istudy-error">API 請求失敗</div>';
    }
}
