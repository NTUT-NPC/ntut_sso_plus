import { startSSO } from "../../core/sso.js";

export function initOtherTab() {
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

    // Theme switching logic
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            document.body.setAttribute('data-theme', theme);
            chrome.storage.local.set({ theme: theme });
        });
    });
}
