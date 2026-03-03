const BASE_URL = 'https://app.ntut.edu.tw/';
const SERVICES = {
    "常用服務 (Favorite)": {
        "北科 i 學園 PLUS": "ischool_plus_oauth",
        "學生請假系統": "sa_010_oauth",
        "課程系統": "aa_0010-oauth",
        "成績查詢專區": "sa_003_oauth",
        "圖書館入口": "lib_002_oauth2",
        "電子郵件": "zimbrasso_oauth",
        "期中撤選": "aa_Online+Course+Withdrawal+System_stu_oauth",
        "期末網路預選 1": "aa_011_oauth",
        "期末網路預選 2": "aa_012_oauth",
        "開學加退選 1": "aa_030_oauth",
        "開學加退選 2": "aa_030_2_oauth",
        "開學加退選 3": "aa_030_3_oauth"
    },
    "教務處 (Academic)": {
        "學業成績查詢": "aa_003_LB_oauth",
        "學業成績查詢(二機)": "aa_003_oauth",
        "電子大頭照上傳": "aa_StuPhoto_oauth",
        "新生網路選課": "aa_016_oauth",
        "新生網路選課(二機)": "aa_017_oauth",
        "期末教學評量": "aa_009_oauth",
        "期末教學評量(二機)": "aa_009_2_oauth",
        "傑出教學獎票選": "aa_038_oauth",
        "暑修需求登錄": "aa_015_oauth",
        "暑修選課繳費單": "aa_029_oauth",
        "畢業生離校系統": "aa-gradu_oauth",
        "家長系統": "aa_ParentSystem_oauth",
        "Easy Test 平台": "aa_easytest_oauth",
        "外語中心資訊系統": "aa_027_oauth"
    },
    "學務處 (Student Affairs)": {
        "學生停車證申請": "sa_005",
        "學生宿舍登錄抽籤": "sa_007_oauth",
        "器材租借系統": "sa_009_oauth",
        "學生請假系統": "sa_010_oauth",
        "就學貸款申請": "sa_SLAS_oauth",
        "英文門檻考試報名": "StuETA_oauth",
        "學生證掛失補發": "ezcard_oauth"
    },
    "其他服務 (Others)": {
        "新學術資源網": "ar_OAUTH",
        "學雜費減免(進修部)": "NTUT_exemption_OCE_oauth",
        "學雜費減免/弱勢助學": "NTUT_exemption_oauth",
        "獎助學金申請": "NTUT_scholarship_oauth",
        "諮商預約系統": "counseling_oauth",
        "入班輔導活動": "Counselors_Activity_System_oauth",
        "建物與設備維修": "ga_008_oauth",
        "化學物質 GHS 管理": "ga_ghs_oauth",
        "線上繳費系統": "OnlinePayment_oauth",
        "教師評鑑及資料庫": "rd_001_oauth",
        "產學合作資訊系統": "rd_003",
        "研究獎助生申請": "rnd-rs-oauth",
        "學術倫理管理系統": "rd_aes_oauth",
        "網路投票系統": "per_001_oauth",
        "網資安全管理": "ipmac_oauth",
        "北科 VCP AI 平台": "inf_vcp_oauth",
        "校園授權軟體": "inf001_oauth",
        "小郵差": "test_postman"
    }
};

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
    setTimeout(() => {
        loginView.classList.add('hidden');
        document.getElementById('main-view').classList.remove('hidden');
    }, 300);
    const container = document.getElementById('service-container');
    container.innerHTML = '';

    Object.entries(SERVICES).forEach(([category, items]) => {
        const header = document.createElement('div');
        header.style = "grid-column: 1 / -1; margin: 15px 0 5px 0; font-size: 13px; font-weight: bold; color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 4px;";
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