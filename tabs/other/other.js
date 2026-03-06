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
}
