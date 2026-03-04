// iStudyTab.js
// Handles the UI and logic for the '其他' tab in the popup
import { silentLoginAndGetJson } from "./iSchoolPlus/iSchoolPlusAPI.js";

export async function loadOtherTabCourses() {
    const otherTab = document.getElementById('tab-other');
    otherTab.innerHTML = '<div class="istudy-loading">載入中...</div>';
    try {
        const res = await fetch('https://istudy.ntut.edu.tw/xmlapi/index.php?action=my-course-list');
        const data = await res.json();
        if (data.code === 0 && data.data && Array.isArray(data.data.list)) {
            const list = data.data.list.map(item => {
                const divId = `course-${item.course_id}`;
                const btnId = `scan-btn-${item.course_id}`;
                return `<div class="istudy-course-block">
                    <div class="istudy-course-row">
                        <span class="istudy-course-title">${item.title}</span>
                        <button class="istudy-scan-btn" id="${btnId}" data-cid="${item.course_id}">檢索檔案</button>
                    </div>
                    <div class="istudy-file-list" id="file-list-${item.course_id}"></div>
                </div>`;
            }).join('');
            otherTab.innerHTML = `<div class="istudy-course-grid">${list}</div>`;

            // Add event listeners for each button
            data.data.list.forEach(item => {
                const btn = document.getElementById(`scan-btn-${item.course_id}`);
                btn.addEventListener('click', async () => {
                    const fileDiv = document.getElementById(`file-list-${item.course_id}`);
                    fileDiv.innerHTML = '載入中...';
                    try {
                        const result = await silentLoginAndGetJson(item.course_id);
                        if (result && result.data) {
                            // Prefer path.item if present, else fallback to list
                            if (result.data.path && Array.isArray(result.data.path.item)) {
                                if (result.data.path.item.length === 0) {
                                    fileDiv.innerHTML = '<span class="istudy-empty">無檔案</span>';
                                } else {
                                    fileDiv.innerHTML = '<ul class="istudy-file-ul">' + result.data.path.item.map((f, idx) => {
                                        const text = f.title || f.text || JSON.stringify(f);
                                        const href = f.url || f.link || f.href || f.download_url || '';
                                        if (href && !href.startsWith('istream') && !href.startsWith('about')) {
                                            return `<li><a href=\"#\" class=\"file-download-link istudy-file-link\" data-href=\"${encodeURIComponent(href)}\" data-filename=\"${encodeURIComponent(text)}\">${text}</a></li>`;
                                        } else {
                                            return `<li>${text}</li>`;
                                        }
                                    }).join('') + '</ul>';
                                }
                            } else if (Array.isArray(result.data.list)) {
                                if (result.data.list.length === 0) {
                                    fileDiv.innerHTML = '<span class="istudy-empty">無檔案</span>';
                                } else {
                                    fileDiv.innerHTML = '<ul class="istudy-file-ul">' + result.data.list.map((f, idx) => {
                                        const text = f.title || JSON.stringify(f);
                                        const href = f.url || f.link || f.href || f.download_url || '';
                                        if (href && !href.startsWith('istream') && !href.startsWith('about')) {
                                            return `<li><a href=\"#\" class=\"file-download-link istudy-file-link\" data-href=\"${encodeURIComponent(href)}\" data-filename=\"${encodeURIComponent(text)}\">${text}</a></li>`;
                                        } else {
                                            return `<li>${text}</li>`;
                                        }
                                    }).join('') + '</ul>';
                                }
                            } else {
                                fileDiv.innerHTML = '<span class="istudy-empty">無檔案</span>';
                            }
                        } else {
                            fileDiv.innerHTML = '<span class="istudy-error">無法取得檔案清單</span>';
                        }
                    } catch (e) {
                        fileDiv.innerHTML = '<span class="istudy-error">API 請求失敗</span>';
                    }
                    // Add click handler for download links
                    fileDiv.querySelectorAll('.file-download-link').forEach(link => {
                        link.addEventListener('click', function(e) {
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
