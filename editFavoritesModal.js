import { SERVICES } from "./constants.js";

export function openEditModal(currentFavorites, showMainView) {
    if (document.getElementById('edit-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'edit-modal';

    const title = document.createElement('h3');
    title.innerText = "編輯常用服務";
    title.className = "edit-modal-title";
    modal.appendChild(title);

    const listDiv = document.createElement('div');
    listDiv.id = 'edit-list';

    const selectedSet = new Set(currentFavorites);

    Object.entries(SERVICES).forEach(([category, items]) => {
        Object.entries(items).forEach(([name, code]) => {
            const itemDiv = document.createElement('div');
            const isSelected = selectedSet.has(code);
            itemDiv.className = 'service-item';
            if (isSelected) {
                itemDiv.classList.add('selected');
            }

            itemDiv.innerText = name;

            itemDiv.onclick = () => {
                if (selectedSet.has(code)) {
                    selectedSet.delete(code);
                    itemDiv.classList.remove('selected');
                } else {
                    selectedSet.add(code);
                    itemDiv.classList.add('selected');
                }
            };
            listDiv.appendChild(itemDiv);
        });
    });

    modal.appendChild(listDiv);

    const actionDiv = document.createElement('div');
    actionDiv.className = "edit-actions";

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = "取消";
    cancelBtn.className = "btn-secondary";
    cancelBtn.onclick = () => modal.remove();

    const saveBtn = document.createElement('button');
    saveBtn.innerText = "儲存";
    saveBtn.className = "btn-primary";
    saveBtn.onclick = () => {
        const newFavorites = Array.from(selectedSet);
        chrome.storage.local.set({ custom_favorites: newFavorites }, () => {
            const container = document.getElementById('service-container');
            container.innerHTML = '';
            if (typeof showMainView === 'function') showMainView();
            modal.remove();
        });
    };

    actionDiv.appendChild(cancelBtn);
    actionDiv.appendChild(saveBtn);
    modal.appendChild(actionDiv);

    document.body.appendChild(modal);
}
