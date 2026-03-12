import './course-selector.css';

export default defineContentScript({
    matches: [
        'https://aps-course.ntut.edu.tw/oads/Main*',
        'https://aps-sign1.ntut.edu.tw/oads/Main*',
        'https://isms-nagios.ntut.edu.tw/oads/Main*',
    ],
    runAt: 'document_idle',
    main() {
        const PANEL_ID = 'ntut-sso-cs-panel';
        const SLOT_COUNT = 10;

        if (
            !window.location.href.includes('func=QueryCourse') &&
            !window.location.href.includes('func=DropCourse')
        ) {
            return;
        }

        function init() {
            if (document.getElementById(PANEL_ID)) return;
            injectPanel();
        }

        function injectPanel() {
            const anchor = document.getElementById('subInputForm');
            if (!anchor) return;

            const panel = document.createElement('div');
            panel.id = PANEL_ID;

            const hint = document.createElement('div');
            hint.className = 'ntut-sso-cs-hint';
            hint.textContent = '輸入課號（逗號或空白分隔，最多 10 個）';
            panel.appendChild(hint);

            const row = document.createElement('div');
            row.className = 'ntut-sso-cs-row';

            const courseInput = document.createElement('input');
            courseInput.type = 'text';
            courseInput.id = 'ntut-sso-cs-course-input';
            courseInput.className = 'ntut-sso-cs-course-input';
            courseInput.placeholder = '例：354067 354068';
            courseInput.autocomplete = 'off';
            courseInput.spellcheck = false;

            row.appendChild(courseInput);
            panel.appendChild(row);

            const statusEl = document.createElement('div');
            statusEl.className = 'ntut-sso-cs-status';
            statusEl.id = 'ntut-sso-cs-status';
            panel.appendChild(statusEl);

            const actions = document.createElement('div');
            actions.className = 'ntut-sso-cs-actions';

            const fillBtn = makeBtn('自動填入', 'ntut-sso-cs-btn--primary', '填入頁面欄位並查詢');
            const clearBtn = makeBtn('清除', 'ntut-sso-cs-btn--clear', '清空輸入欄');
            actions.appendChild(fillBtn);
            actions.appendChild(clearBtn);
            panel.appendChild(actions);

            anchor.insertAdjacentElement('afterend', panel);

            fillBtn.addEventListener('click', () => onFill(courseInput, statusEl));
            clearBtn.addEventListener('click', () => onClear(courseInput, statusEl));

            courseInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') onFill(courseInput, statusEl);
            });
        }

        function makeBtn(text: string, cls: string, title: string) {
            const btn = document.createElement('input');
            btn.type = 'button';
            btn.value = text;
            btn.className = `ntut-sso-cs-btn ${cls}`;
            btn.title = title;
            return btn;
        }

        function parseInput(raw: string) {
            const tokens = raw.split(/[\s,，]+/).map((s) => s.trim()).filter(Boolean);
            const seen = new Set();
            const ids: string[] = [];
            let skipped = 0;

            for (const token of tokens) {
                if (!/^\d+$/.test(token)) {
                    skipped++;
                    continue;
                }
                if (seen.has(token)) {
                    skipped++;
                    continue;
                }
                if (ids.length >= SLOT_COUNT) {
                    skipped++;
                    continue;
                }
                seen.add(token);
                ids.push(token);
            }
            return { ids, skipped };
        }

        function getPageInputs() {
            const inputs: HTMLInputElement[] = [];
            for (let i = 1; i <= SLOT_COUNT; i++) {
                const el = document.getElementById(`sbj_num${i}`) as HTMLInputElement;
                if (el) inputs.push(el);
            }
            return inputs;
        }

        function setPageInputValue(inp: HTMLInputElement, val: string) {
            const nativeSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            )!.set;
            nativeSetter!.call(inp, val);
            ['input', 'change', 'keyup'].forEach((type) =>
                inp.dispatchEvent(new Event(type, { bubbles: true }))
            );
            if ((window as any).jQuery) {
                (window as any).jQuery(inp).trigger('input').trigger('change');
            }
        }

        function showStatus(el: HTMLElement & { _timer?: any }, msg: string, type = 'info') {
            el.textContent = msg;
            el.className = `ntut-sso-cs-status ntut-sso-cs-status--${type}`;
            clearTimeout(el._timer);
            el._timer = setTimeout(() => {
                el.textContent = '';
                el.className = 'ntut-sso-cs-status';
            }, 4000);
        }

        function onFill(courseInput: HTMLInputElement, statusEl: HTMLElement) {
            const pageInputs = getPageInputs();
            if (!pageInputs.length) {
                showStatus(statusEl, '找不到頁面課號欄位', 'error');
                return;
            }

            const { ids, skipped } = parseInput(courseInput.value);
            if (!ids.length) {
                showStatus(statusEl, '請輸入有效的數字課號', 'info');
                return;
            }

            pageInputs.forEach((inp, idx) => setPageInputValue(inp, ids[idx] || ''));

            const note = skipped > 0 ? `（略過 ${skipped} 個重複或非數字）` : '';
            showStatus(
                statusEl,
                `已填入 ${ids.length} 個課號${note}`,
                skipped > 0 ? 'info' : 'success'
            );

            setTimeout(() => {
                const queryBtn = document.getElementById('query_sbj') as HTMLInputElement;
                if (queryBtn && !queryBtn.disabled) queryBtn.click();
            }, 300);
        }

        function onClear(courseInput: HTMLInputElement, statusEl: HTMLElement) {
            courseInput.value = '';
            courseInput.focus();
            showStatus(statusEl, '已清除', 'info');
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    },
});
