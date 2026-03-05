import { BASE_URL } from "./constants.js";
import { decrypt, isEncryptedFormat } from "./cryptoUtils.js";

export async function startSSO(apOu) {
    document.body.classList.add('fade-out-exit');

    await new Promise(resolve => setTimeout(resolve, 200));

    try {
        const { uid, pwd: storedPwd } = await chrome.storage.local.get(['uid', 'pwd']);
        let pwd = storedPwd;
        if (isEncryptedFormat(pwd)) {
            let decryptedPwd = null;
            try {
                decryptedPwd = await decrypt(pwd);
            } catch (e) {
                decryptedPwd = null;
            }
            if (!decryptedPwd) {
                await chrome.storage.local.remove(['uid', 'pwd']);
                throw new Error("登入資訊已失效，請重新登入");
            }
            pwd = decryptedPwd;
        }
        if (!uid || !pwd) throw new Error("請先登入");

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
        chrome.tabs.create({ url: finalUrl }, tab => {
            monitorFinalRedirect(tab.id);
        });

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