/**
 * Cryptographic utilities using Web Crypto API (AES-GCM).
 * Handles persistent key management in chrome.storage.local.
 */

const KEY_ALIAS = 'crypto_key_data';

/**
 * Checks if a string appears to be our encrypted JSON format.
 * @param {string} data 
 * @returns {boolean}
 */
export function isEncryptedFormat(data) {
    if (!data || typeof data !== 'string') return false;
    if (!data.startsWith('{') || !data.endsWith('}')) return false;
    try {
        const obj = JSON.parse(data);
        return obj && typeof obj.iv === 'string' && typeof obj.content === 'string';
    } catch {
        return false;
    }
}

async function getOrGenerateKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([KEY_ALIAS], async (result) => {
            if (result[KEY_ALIAS]) {
                try {
                    const keyData = result[KEY_ALIAS];
                    const key = await crypto.subtle.importKey(
                        'jwk',
                        keyData,
                        { name: 'AES-GCM', length: 256 },
                        true,
                        ['encrypt', 'decrypt']
                    );
                    resolve(key);
                } catch (e) {
                    // If import fails, generate a new one
                    const newKey = await generateAndStoreKey();
                    resolve(newKey);
                }
            } else {
                const newKey = await generateAndStoreKey();
                resolve(newKey);
            }
        });
    });
}

async function generateAndStoreKey() {
    const key = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    const keyData = await crypto.subtle.exportKey('jwk', key);
    await new Promise(r => chrome.storage.local.set({ [KEY_ALIAS]: keyData }, r));
    return key;
}

/**
 * Encrypts a plaintext string.
 * @param {string} plainText 
 * @returns {Promise<string>} Base64 encoded JSON string containing iv and ciphertext.
 */
export async function encrypt(plainText) {
    if (!plainText) return null;
    const key = await getOrGenerateKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encoded = encoder.encode(plainText);

    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );

    const combined = {
        iv: btoa(String.fromCharCode(...iv)),
        content: btoa(String.fromCharCode(...new Uint8Array(ciphertext)))
    };
    return JSON.stringify(combined);
}

/**
 * Decrypts an encrypted string.
 * @param {string} encryptedData Base64 encoded JSON string from encrypt().
 * @returns {Promise<string>} Original plaintext.
 */
export async function decrypt(encryptedData) {
    if (!encryptedData) return null;
    try {
        const { iv, content } = JSON.parse(encryptedData);
        const key = await getOrGenerateKey();

        const ivBuffer = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
        const contentBuffer = Uint8Array.from(atob(content), c => c.charCodeAt(0));

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: ivBuffer },
            key,
            contentBuffer
        );

        return new TextDecoder().decode(decrypted);
    } catch (e) {
        console.error('Decryption failed:', e);
        return null;
    }
}
