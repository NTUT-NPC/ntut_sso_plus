import { setupLoginHandlers } from "./loginHandlers.js";
import { setupTabHandlers } from "./tabHandlers.js";
import { renderServiceList } from "./renderServiceList.js";
import { startSSO } from "./ssoservice.js";

import { DEFAULT_FAVORITES } from "./constants.js";
import { openEditModal } from "./editFavoritesModal.js";



function showMainView() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
    chrome.storage.local.get(['custom_favorites'], (result) => {
        const favorites = result.custom_favorites || DEFAULT_FAVORITES;
        const container = document.getElementById('service-container');
        renderServiceList(container, favorites);
        const editBtn = container.querySelector('#edit-fav-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                openEditModal(favorites, showMainView);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.classList.add('hidden'), 500);
        }
    }, 800);

    const loginTitle = document.querySelector('#login-view h3');
    if (loginTitle) {
        loginTitle.replaceChildren();
        const brandTitle = document.createElement('div');
        brandTitle.className = "brand-title";
        brandTitle.textContent = "NTUT SSO";
        const brandPlus = document.createElement('span');
        brandPlus.className = "brand-plus";
        brandPlus.textContent = "+";
        brandTitle.appendChild(brandPlus);
        loginTitle.appendChild(brandTitle);
    }

    setupLoginHandlers({ onLoginSuccess: showMainView });
    setupTabHandlers({});

    // Experimental tab — course server buttons
    const btnConfigs = [
        { id: 'open-course-1-btn', apOu: 'aa_030_oauth' },
        { id: 'open-course-2-btn', apOu: 'aa_030_2_oauth' },
        { id: 'open-course-3-btn', apOu: 'aa_030_3_oauth' },
        { id: 'open-ischool-btn', apOu: 'ischool_plus_oauth' }
    ];

    btnConfigs.forEach(config => {
        const btn = document.getElementById(config.id);
        if (btn) {
            btn.addEventListener('click', () => startSSO(config.apOu));
        }
    });
});