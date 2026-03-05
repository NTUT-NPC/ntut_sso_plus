// Handles login form logic and storage
import { BASE_URL } from "./constants.js";

export function setupLoginHandlers({ onLoginSuccess }) {
    const saveBtn = document.getElementById('save-btn');
    const resetBtn = document.getElementById('reset-btn');
    const statusDiv = document.getElementById('status');
    const loginForm = document.getElementById('login-view');

    chrome.storage.local.get(['uid', 'pwd'], async (result) => {
        if (!result.uid || !result.pwd) return;

        // Silently re-validate stored credentials against the server
        statusDiv.style.color = "#2563eb";
        statusDiv.innerText = "自動登入中...";
        try {
            const loginParams = new URLSearchParams({ muid: result.uid, mpassword: result.pwd });
            const loginRes = await fetch(`${BASE_URL}login.do?${loginParams.toString()}`, {
                method: 'POST'
            });
            const loginBody = JSON.parse(await loginRes.text());
            if (loginBody.success) {
                onLoginSuccess();
            } else {
                chrome.storage.local.remove(['uid', 'pwd']);
                statusDiv.style.color = "#ef4444";
                statusDiv.innerText = "儲存的帳號已失效，請重新登入";
            }
        } catch {
            // Network error or parse failure — stay on login form silently
            statusDiv.innerText = "";
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
                        onLoginSuccess();
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
}
