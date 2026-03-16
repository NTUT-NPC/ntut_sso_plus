import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

import { browser } from 'wxt/browser';

let redirected = false;

const doRedirect = () => {
    if (redirected) return;
    redirected = true;
    browser.tabs.create({ url: browser.runtime.getURL('/mobile.html') });
    window.close();
};

// 1. Fast synchronous check to prevent UI flash
if (navigator.userAgent.includes('Android')) {
    doRedirect();
}

// 2. Secondary verification using Extension API (as a fallback)
const checkPlatform = async () => {
    try {
        const info = await browser.runtime.getPlatformInfo();
        if (info.os === 'android' && !window.location.pathname.includes('mobile.html')) {
            doRedirect();
        }
    } catch (e) {
        // Fallback or ignore
    }
};

checkPlatform();

createApp(App).mount('#app');
