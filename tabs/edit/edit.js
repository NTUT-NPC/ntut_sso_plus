import { SERVICES, DEFAULT_FAVORITES } from "../../core/constants.js";

export function initEditTab(showMainView) {
    const listDiv = document.getElementById('edit-list');
    if (!listDiv) return;

    chrome.storage.local.get(['custom_favorites'], (result) => {
        const currentFavorites = result.custom_favorites || DEFAULT_FAVORITES;
        const selectedSet = new Set(currentFavorites);

        function renderList() {
            listDiv.replaceChildren();

            Object.entries(SERVICES).forEach(([category, items]) => {
                const header = document.createElement('div');
                header.innerText = category;
                header.className = 'category-header';
                listDiv.appendChild(header);

                Object.entries(items).forEach(([name, code]) => {
                    const itemDiv = document.createElement('div');
                    const isSelected = selectedSet.has(code);

                    itemDiv.className = isSelected ? 'edit-item selected' : 'edit-item';
                    itemDiv.innerText = name;

                    itemDiv.onclick = () => {
                        if (selectedSet.has(code)) {
                            selectedSet.delete(code);
                            itemDiv.classList.remove('selected');
                        } else {
                            if (selectedSet.size >= 12) {
                                alert("最多只能設定 12 個常用服務");
                                return;
                            }
                            selectedSet.add(code);
                            itemDiv.classList.add('selected');
                        }

                        const newFavorites = Array.from(selectedSet);
                        chrome.storage.local.set({ custom_favorites: newFavorites }, () => {
                            if (typeof showMainView === 'function') {
                                // Re-render the main view
                                showMainView();
                            }
                        });
                    };
                    listDiv.appendChild(itemDiv);
                });
            });
        }

        renderList();
    });
}
