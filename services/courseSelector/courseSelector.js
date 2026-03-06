/**
 * 北科大 SSO+ — 加退選快速填課輔助
 *
 * 注入位置：導覽列 #QueryCourse <li> 的下方（同層 <li>）
 * 操作：輸入課號（逗號或空白分隔）→ 自動填入頁面欄位並查詢
 */

(function () {
    'use strict';

    const PANEL_ID = 'ntut-sso-cs-panel';
    const SLOT_COUNT = 10;

    // ── Guard ──────────────────────────────────────────────────────────────────
    if (!window.location.href.includes('func=QueryCourse') &&
        !window.location.href.includes('func=DropCourse')) {
        return;
    }

    // ── Boot ───────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        if (document.getElementById(PANEL_ID)) return;
        injectPanel();
    }

    // ── Build & inject panel ───────────────────────────────────────────────────
    function injectPanel() {
        // Find the anchor: the #subInputForm
        const anchor = document.getElementById('subInputForm');
        if (!anchor) return;

        const panel = document.createElement('div');
        panel.id = PANEL_ID;

        // Hint
        const hint = document.createElement('div');
        hint.className = 'ntut-sso-cs-hint';
        hint.textContent = '輸入課號（逗號或空白分隔，最多 10 個）';
        panel.appendChild(hint);

        // Input row
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

        // Status
        const statusEl = document.createElement('div');
        statusEl.className = 'ntut-sso-cs-status';
        statusEl.id = 'ntut-sso-cs-status';
        panel.appendChild(statusEl);

        // Buttons
        const actions = document.createElement('div');
        actions.className = 'ntut-sso-cs-actions';

        const fillBtn = makeBtn('自動填入', 'ntut-sso-cs-btn--primary', '填入頁面欄位並查詢');
        const clearBtn = makeBtn('清除', 'ntut-sso-cs-btn--clear', '清空輸入欄');
        actions.appendChild(fillBtn);
        actions.appendChild(clearBtn);
        panel.appendChild(actions);

        // Insert after #subInputForm
        anchor.insertAdjacentElement('afterend', panel);

        // Wire events
        fillBtn.addEventListener('click', () => onFill(courseInput, statusEl));
        clearBtn.addEventListener('click', () => onClear(courseInput, statusEl));

        // Also trigger fill on Enter key
        courseInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') onFill(courseInput, statusEl);
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    function makeBtn(text, cls, title) {
        const btn = document.createElement('input');
        btn.type = 'button';
        btn.value = text;
        btn.className = `ntut-sso-cs-btn ${cls}`;
        btn.title = title;
        return btn;
    }

    /**
     * Parse raw input → validated, deduplicated, numeric-only array.
     * Returns { ids: string[], skipped: number }
     */
    function parseInput(raw) {
        const tokens = raw.split(/[\s,，]+/).map(s => s.trim()).filter(Boolean);
        const seen = new Set();
        const ids = [];
        let skipped = 0;

        for (const token of tokens) {
            if (!/^\d+$/.test(token)) { skipped++; continue; } // non-numeric
            if (seen.has(token)) { skipped++; continue; } // duplicate
            if (ids.length >= SLOT_COUNT) { skipped++; continue; } // over limit
            seen.add(token);
            ids.push(token);
        }
        return { ids, skipped };
    }

    function getPageInputs() {
        const inputs = [];
        for (let i = 1; i <= SLOT_COUNT; i++) {
            const el = document.getElementById(`sbj_num${i}`);
            if (el) inputs.push(el);
        }
        return inputs;
    }

    const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
    ).set;

    function setPageInputValue(inp, val) {
        nativeSetter.call(inp, val);
        ['input', 'change', 'keyup'].forEach(type =>
            inp.dispatchEvent(new Event(type, { bubbles: true }))
        );
        if (window.jQuery) {
            window.jQuery(inp).trigger('input').trigger('change');
        }
    }

    function showStatus(el, msg, type = 'info') {
        el.textContent = msg;
        el.className = `ntut-sso-cs-status ntut-sso-cs-status--${type}`;
        clearTimeout(el._timer);
        el._timer = setTimeout(() => {
            el.textContent = '';
            el.className = 'ntut-sso-cs-status';
        }, 4000);
    }

    // ── Actions ────────────────────────────────────────────────────────────────
    function onFill(courseInput, statusEl) {
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
        showStatus(statusEl, `已填入 ${ids.length} 個課號${note}`, skipped > 0 ? 'info' : 'success');

        setTimeout(() => {
            const queryBtn = document.getElementById('query_sbj');
            if (queryBtn && !queryBtn.disabled) queryBtn.click();
        }, 300);
    }

    function onClear(courseInput, statusEl) {
        courseInput.value = '';
        courseInput.focus();
        showStatus(statusEl, '已清除', 'info');
    }

})();
