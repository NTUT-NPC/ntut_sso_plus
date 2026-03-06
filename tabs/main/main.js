import { SERVICES, DEFAULT_FAVORITES } from "../../core/constants.js";
import { startSSO } from "../../core/sso.js";

function findNameByCode(code) {
    for (const cat in SERVICES) {
        for (const [name, c] of Object.entries(SERVICES[cat])) {
            if (c === code) return name;
        }
    }
    return code;
}

export function renderServiceList(container, favorites) {
    container.replaceChildren();
    const favHeader = document.createElement('div');
    favHeader.className = "category-header fav-header";

    const titleSpan = document.createElement('span');
    titleSpan.textContent = "常用服務";
    favHeader.appendChild(titleSpan);

    container.appendChild(favHeader);

    if (favorites.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.innerText = "尚未設定常用服務";
        emptyMsg.className = "empty-favorites-msg";
        container.appendChild(emptyMsg);
    } else {
        favorites.forEach(code => {
            const name = findNameByCode(code);
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
        header.innerText = category;
        header.className = "category-header service-category-header";
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

export function initMainTab() {
    chrome.storage.local.get(['custom_favorites'], (result) => {
        const favorites = result.custom_favorites || DEFAULT_FAVORITES;
        const container = document.getElementById('service-container');
        if (container) {
            renderServiceList(container, favorites);
        }
    });
}
