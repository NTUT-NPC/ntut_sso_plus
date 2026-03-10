/**
 * nPortal Autofill Content Script
 *
 * Automatically fills the username (#muid) and password (#mpassword)
 * fields on the NTUT portal login page (https://nportal.ntut.edu.tw/index.do)
 * using credentials stored by the extension.
 */

(function () {
    'use strict';

    const KEY_ALIAS = 'crypto_key_data';

    /**
     * Checks if a string appears to be our encrypted JSON format.
     */
    function isEncryptedFormat(data) {
        if (!data || typeof data !== 'string') return false;
        if (!data.startsWith('{') || !data.endsWith('}')) return false;
        try {
            const obj = JSON.parse(data);
            return obj && typeof obj.iv === 'string' && typeof obj.content === 'string';
        } catch {
            return false;
        }
    }

    /**
     * Decrypts an AES-GCM encrypted string using the key from storage.
     */
    async function decryptPassword(encryptedData) {
        if (!encryptedData) return null;
        try {
            const result = await chrome.storage.local.get([KEY_ALIAS]);
            const keyData = result[KEY_ALIAS];
            if (!keyData) {
                console.warn('[SSO+ nPortal] No crypto key found in storage.');
                return null;
            }

            const key = await crypto.subtle.importKey(
                'jwk',
                keyData,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt']
            );

            const { iv, content } = JSON.parse(encryptedData);
            const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
            const contentBuffer = Uint8Array.from(atob(content), c => c.charCodeAt(0));

            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: ivBuffer },
                key,
                contentBuffer
            );

            return new TextDecoder().decode(decrypted);
        } catch (e) {
            console.error('[SSO+ nPortal] Decryption failed:', e);
            return null;
        }
    }

    /**
     * Sets a native input value and dispatches input/change events
     * so the page's framework recognises the change.
     */
    function setNativeValue(el, value) {
        const nativeInputValueSetter =
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
    }

    /**
     * Main autofill logic.
     */
    async function autofill() {
        const uidField = document.getElementById('muid');
        const pwdField = document.getElementById('mpassword');

        if (!uidField || !pwdField) {
            console.log('[SSO+ nPortal] Login fields not found on this page.');
            return;
        }

        // Don't overwrite if the user has already typed something
        if (uidField.value || pwdField.value) {
            console.log('[SSO+ nPortal] Fields already have values, skipping autofill.');
            return;
        }

        try {
            const stored = await chrome.storage.local.get(['uid', 'pwd', 'nportal_autofill']);

            if (stored.nportal_autofill === false) {
                console.log('[SSO+ nPortal] Autofill is explicitly disabled in settings.');
                return;
            }

            if (!stored.uid || !stored.pwd) {
                console.log('[SSO+ nPortal] No saved credentials found.');
                return;
            }

            let password = stored.pwd;

            // Decrypt if encrypted
            if (isEncryptedFormat(password)) {
                const decrypted = await decryptPassword(password);
                if (!decrypted) {
                    console.warn('[SSO+ nPortal] Could not decrypt password.');
                    return;
                }
                password = decrypted;
            }

            // Fill in the fields
            setNativeValue(uidField, stored.uid);
            setNativeValue(pwdField, password);

            // Focus the authcode field so the user only needs to type the captcha
            const authcodeField = document.getElementById('authcode');
            if (authcodeField) {
                authcodeField.focus();
            }

            console.log('[SSO+ nPortal] Autofill complete. Please enter the captcha.');
        } catch (err) {
            console.error('[SSO+ nPortal] Autofill error:', err);
        }
    }

    // Run autofill when the page is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autofill);
    } else {
        autofill();
    }
})();
