import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    outDir: 'dist',
    modules: ['@wxt-dev/module-vue'],
    manifest: {
        name: '北科大 SSO+',
        version: '26.3.18',
        description: '提供北科學生免密碼與免驗證碼快速存取校內系統的瀏覽器擴充功能。',
        permissions: [
            'storage',
            'declarativeNetRequest',
            'downloads',
            'tabs',
        ],
        host_permissions: [
            'https://app.ntut.edu.tw/*',
            'https://istream.ntut.edu.tw/*',
            'https://istudy.ntut.edu.tw/*',
            'https://aps-course.ntut.edu.tw/*',
            'https://aps-sign1.ntut.edu.tw/*',
            'https://isms-nagios.ntut.edu.tw/*',
        ],
        homepage_url: 'https://github.com/NTUT-NPC/ntut_sso_plus',
        icons: {
            '16': 'icons/icon16.png',
            '32': 'icons/icon32.png',
            '48': 'icons/icon48.png',
            '128': 'icons/icon128.png',
        },
        declarative_net_request: {
            rule_resources: [
                {
                    id: 'ruleset_1',
                    enabled: true,
                    path: 'rules.json',
                },
            ],
        },
        // Firefox specific settings (Chrome ignores these)
        browser_specific_settings: {
            gecko: {
                id: 'ntut-sso-plus@ntut-npc',
                strict_min_version: '142.0', // Updated to follow ESR for now, 142.0 is future/invalid
                data_collection_permissions: {
                    required: ['none'],
                    optional: [],
                },
            } as any,
        },
    },
});
