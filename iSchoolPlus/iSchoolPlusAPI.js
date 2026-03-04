import { startSSO } from "../ssoservice.js";
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
        const data = await res.json();
        
        console.log("🎉 成功在不開窗的情況下拿到 JSON:", data);
        return data;

    } catch (err) {
        console.error("登入或抓取失敗:", err);
    } finally {
        chrome.tabs.create = originalTabsCreate;
    }
}
