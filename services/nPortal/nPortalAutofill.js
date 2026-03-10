/**
 * nPortal Autofill Content Script
 *
 * Automatically fills the username (#muid) and password (#mpassword)
 * fields on the NTUT portal login page (https://nportal.ntut.edu.tw/index.do)
 * using credentials stored by the extension.
 */

(function () {
    'use strict';

    // Determine the URL for the crypto module
    const cryptoUtilsUrl = chrome.runtime.getURL('utils/cryptoUtils.js');

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
            const cryptoUtils = await import(cryptoUtilsUrl);
            if (cryptoUtils.isEncryptedFormat(password)) {
                const decrypted = await cryptoUtils.decrypt(password);
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
