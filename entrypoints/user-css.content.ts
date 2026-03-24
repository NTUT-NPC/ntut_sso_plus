// Auto-discover all CSS files in user-css/ folder at build time.
// Filename = subdomain, e.g. nportal.css → nportal.ntut.edu.tw
//
// Per-section path matching via @match at-rule:
//   @match "/index.do";
//   body { color: red; }
//
//   @match "/login.do";
//   body { color: blue; }
//
// CSS before any @match applies to ALL pages on that subdomain.
// Supports * wildcard, e.g. @match "/course/*";
import { browser } from 'wxt/browser';

import config from './user-css/config.json';

const cssModules = import.meta.glob('./user-css/*.css', { query: '?raw', eager: true });

interface CssSection {
    pattern: string | null;  // null = global (no @match)
    css: string;
}

function parseSections(raw: string): CssSection[] {
    const sections: CssSection[] = [];
    const matchRe = /@match\s+"(.+?)"\s*;/g;
    let lastIndex = 0;
    let m;

    while ((m = matchRe.exec(raw)) !== null) {
        // CSS before this @match (global or belongs to previous section)
        const before = raw.slice(lastIndex, m.index).trim();
        if (before) {
            // If no section exists yet, this is global CSS
            if (sections.length === 0) {
                sections.push({ pattern: null, css: before });
            } else {
                // Append to previous section
                sections[sections.length - 1].css += '\n' + before;
            }
        }
        // Start new section for this @match
        sections.push({ pattern: m[1], css: '' });
        lastIndex = m.index + m[0].length;
    }

    // Remaining CSS after last @match
    const remaining = raw.slice(lastIndex).trim();
    if (remaining) {
        if (sections.length === 0) {
            sections.push({ pattern: null, css: remaining });
        } else {
            sections[sections.length - 1].css += '\n' + remaining;
        }
    }

    return sections;
}

const CSS_MAP: Record<string, CssSection[]> = {};
for (const [path, mod] of Object.entries(cssModules)) {
    const filename = path.split('/').pop()!;
    const raw = (mod as { default: string }).default;
    const sections = parseSections(raw);
    CSS_MAP[filename] = sections;
}

function urlMatches(url: string, pattern: string): boolean {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp('^' + escaped + '$').test(url);
}

export default defineContentScript({
    matches: ['https://*.ntut.edu.tw/*'],
    allFrames: true,
    matchAboutBlank: true,
    runAt: 'document_start',
    async main() {
        try {
            const currentUrl = window.location.href;
            const hostname = window.location.hostname;
            const subdomain = hostname.replace('.ntut.edu.tw', '');

            // Find all matching configs
            const activeConfigs = config.filter(c =>
                c.matches.some(pattern => urlMatches(currentUrl, pattern))
            );

            if (activeConfigs.length === 0) {
                console.warn('[NTUT SSO+] No user CSS found for URL:', currentUrl);
            }

            const updateCss = async () => {
                try {
                    const { userCssSettings } = await browser.storage.local.get('userCssSettings') as { userCssSettings?: Record<string, boolean> };
                    const settings = userCssSettings ?? { global: true };

                    const isGlobalEnabled = settings.global !== false;
                    // For backward compatibility, we still check subdomain toggle.
                    // If multiple CSS files are injected, they all depend on the subdomain toggle for now.
                    const isSubdomainEnabled = settings[subdomain] !== false;

                    if (!isGlobalEnabled || !isSubdomainEnabled) {
                        document.getElementById('ntut-sso-user-css')?.remove();
                        return;
                    }

                    let combinedCss = '';
                    for (const conf of activeConfigs) {
                        const cssFiles = Array.isArray(conf.css) ? conf.css : [conf.css];
                        for (const cssFile of cssFiles) {
                            const sections = CSS_MAP[cssFile];
                            if (sections && Array.isArray(sections)) {
                                // Filter sections based on @match if present
                                for (const section of sections) {
                                    if (!section.pattern || urlMatches(window.location.pathname, section.pattern)) {
                                        combinedCss += section.css + '\n';
                                    }
                                }
                            }
                        }
                    }

                    if (combinedCss.trim()) {
                        let style = document.getElementById('ntut-sso-user-css') as HTMLStyleElement;
                        if (!style) {
                            style = document.createElement('style');
                            style.id = 'ntut-sso-user-css';
                            (document.head || document.documentElement).appendChild(style);
                        }
                        style.textContent = combinedCss;
                    } else {
                        document.getElementById('ntut-sso-user-css')?.remove();
                    }
                } catch (err) {
                    console.error('[NTUT SSO+] Error in updateCss:', err);
                }
            };

            // 1. Inject CSS
            await updateCss();

            // Listen for storage changes to dynamic update CSS
            browser.storage.onChanged.addListener((changes) => {
                try {
                    if (changes.userCssSettings) {
                        updateCss();
                    }
                } catch (err) {
                    console.error('[NTUT SSO+] Error in storage change handler:', err);
                }
            });

            // 2. Enable Autocomplete (ONLY for muid/password and add hints for Bitwarden)
            function enableAutocomplete() {
                try {
                    // Target specific fields: Username (muid, username) and Password
                    const usernameSelector = 'input[name="muid"], input#muid, input[name="username"]';
                    const passwordSelector = 'input[type="password"]';

                    // Handle Username
                    const usernameFields = document.querySelectorAll(usernameSelector);
                    usernameFields.forEach((el) => {
                        if (el.getAttribute('autocomplete') === 'off') {
                            el.removeAttribute('autocomplete');
                        }
                        if (!el.getAttribute('autocomplete')) {
                            el.setAttribute('autocomplete', 'username');
                        }
                    });

                    // Handle Password
                    const passwordFields = document.querySelectorAll(passwordSelector);
                    passwordFields.forEach((el) => {
                        if (el.getAttribute('autocomplete') === 'off' || el.getAttribute('autocomplete') === 'new-password') {
                            el.removeAttribute('autocomplete');
                        }
                        if (!el.getAttribute('autocomplete')) {
                            el.setAttribute('autocomplete', 'current-password');
                        }
                    });
                } catch (err) {
                    console.error('[NTUT SSO+] Error in enableAutocomplete:', err);
                }
            }

            // Run immediately and periodically/on changes
            enableAutocomplete();
            const observer = new MutationObserver(enableAutocomplete);
            observer.observe(document.documentElement, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['autocomplete'],
            });

            // Some sites re-add it in their own scripts, so we check a few times
            for (let delay of [500, 1000, 2000, 5000]) {
                setTimeout(enableAutocomplete, delay);
            }
        } catch (err) {
            console.error('[NTUT SSO+] Uncaught error in main content script:', err);
        }
    },
});
