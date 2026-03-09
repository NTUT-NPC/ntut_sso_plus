import { setupLoginHandlers } from "./login/login.js";
import { setupTabHandlers } from "./core/tabs.js";
import { initMainTab } from "./tabs/main/main.js";
import { initEditTab } from "./tabs/edit/edit.js";
import { initOtherTab } from "./tabs/other/other.js";

async function loadContent(containerId, htmlPath) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
        const response = await fetch(htmlPath);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        container.replaceChildren(...doc.body.childNodes);
    } catch (err) {
        console.error(`Failed to load content for ${containerId}:`, err);
    }
}

async function showMainView() {
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) loginContainer.classList.add('hidden');

    document.getElementById('main-view').classList.remove('hidden');

    // Load tabs if not already loaded
    if (document.getElementById('tab-main').childElementCount === 0) {
        await Promise.all([
            loadContent('tab-main', 'tabs/main/main.html'),
            loadContent('tab-edit', 'tabs/edit/edit.html'),
            loadContent('tab-other', 'tabs/other/other.html')
        ]);

        initMainTab();
        initEditTab(initMainTab); // Re-render main on edit
        initOtherTab();
    } else {
        initMainTab();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Load saved theme
    chrome.storage.local.get(['theme'], (result) => {
        if (result.theme) {
            document.body.setAttribute('data-theme', result.theme);
        }
    });

    // Load login view first
    await loadContent('login-container', 'login/login.html');

    setupLoginHandlers({ onLoginSuccess: showMainView });
    setupTabHandlers({});

    // Window Mode: Open in new window
    const popWindowBtn = document.getElementById('popwindow-btn');
    if (popWindowBtn) {
        popWindowBtn.addEventListener('click', () => {
            chrome.windows.create({
                url: chrome.runtime.getURL('popup.html'),
                type: 'popup',
                width: 720,
                height: 640,
            });
            window.close();
        });
    }
    const popoutBtn = document.getElementById('popout-btn');
    if (popoutBtn) {
        popoutBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
        });
    }

});