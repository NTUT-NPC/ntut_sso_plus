const BASE_URL = 'https://app.ntut.edu.tw/';

const SERVICES = {
    "教務系統": {
        "課程系統": "aa_0010-oauth",
        "北科 i 學園 PLUS": "ischool_plus_oauth",                
        "學業成績查詢 1": "aa_003_oauth",   //original: 學業成績查詢(二機)
        "新生網路選課 1": "aa_016_oauth",
        "新生網路選課 2": "aa_017_oauth",
        "期中撤選": "aa_Online+Course+Withdrawal+System_stu_oauth",                
        "開學加退選 1": "aa_030_oauth",
        "開學加退選 2": "aa_030_2_oauth",
        "開學加退選 3": "aa_030_3_oauth",        
        "期末網路預選 1": "aa_011_oauth",
        "期末網路預選 2": "aa_012_oauth",        
        "暑修需求登錄": "aa_015_oauth",        
        "期末教學評量 1": "aa_009_oauth",
        "期末教學評量 2": "aa_009_2_oauth",        
        "傑出教學獎票選": "aa_038_oauth",
        "暑修選課繳費單": "aa_029_oauth",
        "畢業生離校系統": "aa-gradu_oauth",
        "家長系統": "aa_ParentSystem_oauth",
        "Easy Test 平台": "aa_easytest_oauth",
        "外語中心資訊系統": "aa_027_oauth",
        "電子大頭照上傳": "aa_StuPhoto_oauth",        
        "學業成績查詢 2": "aa_003_LB_oauth" //original: 學業成績查詢
    },    
    "學務系統": {
        "學生查詢專區": "sa_003_oauth",
        "學生請假系統": "sa_010_oauth",
        "學生停車證申請": "sa_005",
        "學生宿舍登錄抽籤": "sa_007_oauth",
        "器材租借系統": "sa_009_oauth",
        "就學貸款申請": "sa_SLAS_oauth",
        "英文門檻考試報名": "StuETA_oauth",
        "學生證掛失補發": "ezcard_oauth"
    },
    "其他服務": {
        "圖書館入口": "lib_002_oauth2",
        "獎助學金申請": "NTUT_scholarship_oauth",
        "網路資訊安全管理": "ipmac_oauth",
        "學雜費減免/弱勢助學": "NTUT_exemption_oauth",
        "學雜費減免（進修部）": "NTUT_exemption_OCE_oauth",                               
        "電子郵件": "zimbrasso_oauth",
        "北科 VCP AI 平台": "inf_vcp_oauth",
        "校園授權軟體": "inf001_oauth",
        "諮商預約系統": "counseling_oauth",                
        "新學術資源網": "ar_OAUTH",
        "入班輔導活動": "Counselors_Activity_System_oauth",
        "建物與設備維修": "ga_008_oauth",
        "化學物質 GHS 管理": "ga_ghs_oauth",
        "線上繳費系統": "OnlinePayment_oauth",
        "教師評鑑及資料庫": "rd_001_oauth",
        "產學合作資訊系統": "rd_003",
        "研究獎助生申請": "rnd-rs-oauth",
        "學術倫理管理系統": "rd_aes_oauth",
        "網路投票系統": "per_001_oauth",
        "小郵差": "test_postman"
    }
};

const DEFAULT_FAVORITES = [
    "ischool_plus_oauth", "sa_010_oauth", "aa_0010-oauth",
    "sa_003_oauth", "lib_002_oauth2", "zimbrasso_oauth"
];

function findNameByCode(code) {
    for (const cat in SERVICES) {
        for (const [name, c] of Object.entries(SERVICES[cat])) {
            if (c === code) return name;
        }
    }
    return code; 
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        splash.style.opacity = '0';
        setTimeout(() => splash.classList.add('hidden'), 500);
    }, 800);

    const loginTitle = document.querySelector('#login-view h3');
    loginTitle.innerHTML = `<div class="brand-title">NTUT SSO<span class="brand-plus">+</span></div>`;
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const statusDiv = document.getElementById('status');
    const loginForm = document.getElementById('login-view');

    chrome.storage.local.get(['uid', 'pwd'], (result) => {
        if (result.uid && result.pwd) {
            showMainView();
        }
    });

    saveBtn.addEventListener('click', async () => {
        const uid = document.getElementById('username').value;
        const pwd = document.getElementById('password').value;

        if (!uid || !pwd) {
            statusDiv.innerText = "請輸入帳密";
            return;
        }

        saveBtn.disabled = true;
        saveBtn.innerText = "驗證中...";
        statusDiv.style.color = "#2563eb";
        statusDiv.innerText = "正在驗證帳號密碼...";

        try {
            const loginParams = new URLSearchParams({ muid: uid, mpassword: pwd });
            const loginRes = await fetch(`${BASE_URL}login.do?${loginParams.toString()}`, { 
                method: 'POST' 
            });

            const loginText = await loginRes.text();
            let loginBody;
            try {
                loginBody = JSON.parse(loginText);
            } catch (e) {
                throw new Error("伺服器回應格式異常");
            }

            if (loginBody.success) {
                chrome.storage.local.set({ uid, pwd }, () => {
                    statusDiv.innerText = "驗證成功！";
                    setTimeout(() => {
                        showMainView();
                        saveBtn.disabled = false;
                        saveBtn.innerText = "儲存並進入選單";
                    }, 500);
                });
            } else {
                throw new Error(loginBody.msg || "帳號或密碼錯誤");
            }
        } catch (err) {
            statusDiv.style.color = "#ef4444";
            statusDiv.innerText = `失敗: ${err.message}`;
            saveBtn.disabled = false;
            saveBtn.innerText = "儲存並進入選單";
        }
    });

    resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.storage.local.clear(() => location.reload());
    });

    loginForm.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveBtn.click();
        }
    });
});

function showMainView() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
    
    // Read user settings; if not found, use default values.
    chrome.storage.local.get(['custom_favorites'], (result) => {
        const favorites = result.custom_favorites || DEFAULT_FAVORITES;
        const container = document.getElementById('service-container');
        container.innerHTML = '';

        const favHeader = document.createElement('div');
        favHeader.className = "category-header";
        favHeader.style = "grid-column: 1 / -1; margin: 15px 0 5px 0; font-size: 15px; font-weight: bold; color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 4px; display: flex; align-items: center; justify-content: space-between;";
        const editIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" style="pointer-events: none;">
            <path fill="currentColor" d="M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z"/>
        </svg>`;

        favHeader.innerHTML = `
            <span>常用服務</span>
            <button id="edit-fav-btn" class="edit-btn" title="編輯常用按鈕" style="display:flex; align-items:center; justify-content:center; padding: 4px; background: transparent; border: none; cursor: pointer; color: var(--text-main);">
                ${editIconSvg}
            </button>`;
        container.appendChild(favHeader);
        favHeader.querySelector('#edit-fav-btn').addEventListener('click', () => {
            openEditModal(favorites);
        });

        if (favorites.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.innerText = "尚未設定常用服務";
            emptyMsg.style = "grid-column: 1/-1; text-align:center; color:#999; font-size:13px; padding:5px;";
            container.appendChild(emptyMsg);
        } else {
            favorites.forEach(code => {
                const name = findNameByCode(code);
                // To avoid displaying "item not found" errors, add a check.
                if (name) {
                    const div = document.createElement('div');
                    div.className = 'service-item';
                    div.innerText = name;
                    div.addEventListener('click', () => startSSO(code));
                    container.appendChild(div);
                }
            });
        }

        Object.entries(SERVICES).forEach(([category, items]) => {
            const header = document.createElement('div');
            header.style = "grid-column: 1 / -1; margin: 15px 0 5px 0; font-size: 15px; font-weight: bold; color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 4px;";
            header.innerText = category;
            header.className = "category-header";
            container.appendChild(header);

            Object.entries(items).forEach(([name, code]) => {
                const div = document.createElement('div');
                div.className = 'service-item';
                div.innerText = name;
                div.setAttribute('data-name', name);
                div.addEventListener('click', () => startSSO(code));
                container.appendChild(div);
            });
        });
    });
}

async function startSSO(apOu) {
    document.body.classList.add('fade-out-exit');

    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        const { uid, pwd } = await chrome.storage.local.get(['uid', 'pwd']);
        const loginParams = new URLSearchParams({ muid: uid, mpassword: pwd });
        const loginRes = await fetch(`${BASE_URL}login.do?${loginParams.toString()}`, { method: 'POST' });
        const loginText = await loginRes.text();
        const loginBody = JSON.parse(loginText);
        if (!loginBody.success) throw new Error("登入失敗");

        const ssoIndexRes = await fetch(`${BASE_URL}ssoIndex.do?apOu=${apOu}`, {
            headers: { 'Referer': `${BASE_URL}login.do` }
        });
        const html = await ssoIndexRes.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const form = doc.querySelector('form[name="ssoForm"]');
        if (!form) throw new Error("找不到 SSO 表單，請檢查該服務是否目前可用");

        const actionUrl = new URL(form.getAttribute('action'), BASE_URL).href;
        const formData = new URLSearchParams();
        form.querySelectorAll('input').forEach(inp => {
            if (inp.name) formData.append(inp.name, inp.value || "");
        });

        const finalRes = await fetch(actionUrl, {
            method: 'POST',
            body: formData,
            redirect: 'manual'
        });

        let location = finalRes.headers.get('Location');

        if (!location) {
            if (finalRes.url && finalRes.url !== actionUrl) {
                location = finalRes.url;
            }
        }

        if (!location) {
            const manualJumpUrl = `${actionUrl}?${formData.toString()}`;
            chrome.tabs.create({ url: manualJumpUrl });
            return;
        }

        const finalUrl = location.replace('http://', 'https://');
        chrome.tabs.create({ url: finalUrl });

    } catch (err) {
        alert("錯誤: " + err.message);
    }
}

function monitorFinalRedirect(tabId) {
    chrome.tabs.onUpdated.addListener(function finalListener(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.url) {
            const url = changeInfo.url;
            if (!url.includes('ssoIndex.do') && !url.includes('login.do')) {
                chrome.tabs.update(tabId, { active: true });
                chrome.tabs.onUpdated.removeListener(finalListener);
            }
        }
    });
}

function openEditModal(currentFavorites) {
    if (document.getElementById('edit-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    modal.style = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: var(--bg); z-index: 50; display: flex; flex-direction: column;
        padding: 20px; box-sizing: border-box; animation: fadeIn 0.3s;
    `;
    
    const title = document.createElement('h3');
    title.innerText = "編輯常用服務";
    title.style.marginBottom = "15px";
    modal.appendChild(title);

    const listDiv = document.createElement('div');
    listDiv.id = 'edit-list';
    listDiv.style = "flex-grow: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding-bottom: 20px;";
    
    const selectedSet = new Set(currentFavorites);

    Object.entries(SERVICES).forEach(([category, items]) => {
        Object.entries(items).forEach(([name, code]) => {
            const itemDiv = document.createElement('div');
            const isSelected = selectedSet.has(code);
            itemDiv.className = 'service-item'; 
            itemDiv.style.border = isSelected ? "1px solid var(--primary)" : "1px solid var(--border)";
            itemDiv.style.background = isSelected ? "var(--primary-glow)" : "var(--card-bg)";
            itemDiv.style.color = isSelected ? "var(--primary)" : "var(--text-main)";
            itemDiv.style.fontSize = "13px";
            
            itemDiv.innerText = name;

            itemDiv.onclick = () => {
                if (selectedSet.has(code)) {
                    selectedSet.delete(code);
                    itemDiv.style.border = "1px solid var(--border)";
                    itemDiv.style.background = "var(--card-bg)";
                    itemDiv.style.color = "var(--text-main)";
                } else {
                    selectedSet.add(code);
                    itemDiv.style.border = "1px solid var(--primary)";
                    itemDiv.style.background = "var(--primary-glow)";
                    itemDiv.style.color = "var(--primary)";
                }
            };
            listDiv.appendChild(itemDiv);
        });
    });

    modal.appendChild(listDiv);

    const actionDiv = document.createElement('div');
    actionDiv.style = "display: flex; gap: 10px; margin-top: 10px;";

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = "取消";

    cancelBtn.style = "flex: 1; padding: 10px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text-main); border-radius: 4px; cursor: pointer;";
    cancelBtn.onclick = () => modal.remove();

    const saveBtn = document.createElement('button');
    saveBtn.innerText = "儲存";
    saveBtn.style = "flex: 1; padding: 10px; border: none; background: var(--primary); color: white; border-radius: 4px; cursor: pointer; font-weight: bold;";
    saveBtn.onclick = () => {
        const newFavorites = Array.from(selectedSet);
        chrome.storage.local.set({ custom_favorites: newFavorites }, () => {
            const container = document.getElementById('service-container');
            container.innerHTML = ''; 
            showMainView(); // Re-execute the main program (it will reread storage).
            modal.remove();
        });
    };

    actionDiv.appendChild(cancelBtn);
    actionDiv.appendChild(saveBtn);
    modal.appendChild(actionDiv);

    document.body.appendChild(modal);
}