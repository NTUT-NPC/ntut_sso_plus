import { setupLoginHandlers } from "./loginHandlers.js";
import { setupTabHandlers } from "./tabHandlers.js";
import { renderServiceList } from "./renderServiceList.js";
import { loadOtherTabCourses } from "./iSchoolPlusTab.js";
import { DEFAULT_FAVORITES } from "./constants.js";
import { openEditModal } from "./editFavoritesModal.js";
import

function showMainView() {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
    chrome.storage.local.get(['custom_favorites'], (result) => {
        const favorites = result.custom_favorites || DEFAULT_FAVORITES;
        const container = document.getElementById('service-container');
        renderServiceList(container, favorites);
        // Set up edit button handler
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
        loginTitle.innerHTML = `<div class="brand-title">NTUT SSO<span class="brand-plus">+</span></div>`;
    }

    setupLoginHandlers({ onLoginSuccess: showMainView });
    setupTabHandlers({ onOtherTab: loadOtherTabCourses });
});