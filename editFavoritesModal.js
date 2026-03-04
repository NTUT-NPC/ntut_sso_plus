import { SERVICES } from "./constants.js";

export function openEditModal(currentFavorites, showMainView) {
    if (document.getElementById('edit-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    modal.style = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        background: var(--bg); z-index: 50; display: flex; flex-direction: column;
        padding: 20px; box-sizing: border-box; animation: fadeIn 0.3s;
    `;
    
    const title = document.createElement('h3');
    title.innerText = "編輯常用服務";
    title.style.marginBottom = "15px";
    modal.appendChild(title);

    const listDiv = document.createElement('div');
    listDiv.id = 'edit-list';
    listDiv.style = "flex-grow: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding-bottom: 20px;";
    
    const selectedSet = new Set(currentFavorites);

    Object.entries(SERVICES).forEach(([category, items]) => {
        Object.entries(items).forEach(([name, code]) => {
            const itemDiv = document.createElement('div');
            const isSelected = selectedSet.has(code);
            itemDiv.className = 'service-item'; 
            itemDiv.style.border = isSelected ? "1px solid var(--primary)" : "1px solid var(--border)";
            itemDiv.style.background = isSelected ? "var(--primary-glow)" : "var(--card-bg)";
            itemDiv.style.color = isSelected ? "var(--primary)" : "var(--text-main)";
            itemDiv.style.fontSize = "13px";
            
            itemDiv.innerText = name;

            itemDiv.onclick = () => {
                if (selectedSet.has(code)) {
                    selectedSet.delete(code);
                    itemDiv.style.border = "1px solid var(--border)";
                    itemDiv.style.background = "var(--card-bg)";
                    itemDiv.style.color = "var(--text-main)";
                } else {
                    selectedSet.add(code);
                    itemDiv.style.border = "1px solid var(--primary)";
                    itemDiv.style.background = "var(--primary-glow)";
                    itemDiv.style.color = "var(--primary)";
                }
            };
            listDiv.appendChild(itemDiv);
        });
    });

    modal.appendChild(listDiv);

    const actionDiv = document.createElement('div');
    actionDiv.style = "display: flex; gap: 10px; margin-top: 10px;";

    const cancelBtn = document.createElement('button');
    cancelBtn.innerText = "取消";
    cancelBtn.style = "flex: 1; padding: 10px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text-main); border-radius: 4px; cursor: pointer;";
    cancelBtn.onclick = () => modal.remove();

    const saveBtn = document.createElement('button');
    saveBtn.innerText = "儲存";
    saveBtn.style = "flex: 1; padding: 10px; border: none; background: var(--primary); color: white; border-radius: 4px; cursor: pointer; font-weight: bold;";
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
