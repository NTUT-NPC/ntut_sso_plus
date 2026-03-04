import { SERVICES } from "./constants.js";
import { startSSO } from "./ssoservice.js";

function findNameByCode(code) {
    for (const cat in SERVICES) {
        for (const [name, c] of Object.entries(SERVICES[cat])) {
            if (c === code) return name;
        }
    }
    return code; 
}

export function renderServiceList(container, favorites) {
    container.innerHTML = '';
    const favHeader = document.createElement('div');
    favHeader.className = "category-header fav-header";
    const editIconSvg = `
        <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" class=\"edit-icon-svg\">
            <path fill=\"currentColor\" d=\"M5 19h1.425L16.2 9.225L14.775 7.8L5 17.575zm-2 2v-4.25L16.2 3.575q.3-.275.663-.425t.762-.15t.775.15t.65.45L20.425 5q.3.275.438.65T21 6.4q0 .4-.137.763t-.438.662L7.25 21zM19 6.4L17.6 5zm-3.525 2.125l-.7-.725L16.2 9.225z\"/>
        </svg>`;
    favHeader.innerHTML = `
        <span>常用服務</span>
        <button id=\"edit-fav-btn\" class=\"edit-btn edit-fav-btn\" title=\"編輯常用按鈕\">${editIconSvg}</button>`;
    container.appendChild(favHeader);
    // The edit button handler should be set by the caller

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
