import { startSSO } from "../../../core/sso.js";
export async function silentLoginAndGetJson(cid) {
    const AP_OU = "ischool_plus_oauth";
    const originalTabsCreate = chrome.tabs.create;

    chrome.tabs.create = (obj) => {
        console.log("攔截到開窗請求，URL 為:", obj.url);
        fetch(obj.url);
        return { id: 999 };
    };

    try {
        await startSSO(AP_OU);
        await new Promise(r => setTimeout(r, 800));
        const apiUrl = `https://istudy.ntut.edu.tw/xmlapi/index.php?action=my-course-path-info&onlyProgress=0&descendant=1&cid=${cid}`;
        const res = await fetch(apiUrl);

        if (!res.ok) {
            throw new Error(`API 回應異常 (HTTP ${res.status})`);
        }

        const contentType = res.headers.get('Content-Type') || '';
        if (!contentType.includes('application/json')) {
            const preview = (await res.text()).substring(0, 120);
            throw new Error(`預期 JSON 回應，但收到 ${contentType || '未知類型'}：${preview}`);
        }

        const data = await res.json();
        console.log("🎉 成功在不開窗的情況下拿到 JSON:", data);
        return data;

    } catch (err) {
        console.error("登入或抓取失敗:", err);
        return null;
    } finally {
        chrome.tabs.create = originalTabsCreate;
    }
}
