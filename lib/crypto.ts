import CryptoJS from 'crypto-js';

const DEFAULT_PASSPHRASE = 'unmotivational-letters-secure-default-key-2024';

export const encrypt = (text: string, passphrase?: string): string => {
  const key = passphrase || DEFAULT_PASSPHRASE;
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decrypt = (ciphertext: string, passphrase?: string): string => {
  const key = passphrase || DEFAULT_PASSPHRASE;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
};

export const saveToStorage = (key: string, value: string, passphrase?: string) => {
  if (typeof window === 'undefined') return;
  try {
    const encrypted = encrypt(value, passphrase);
    localStorage.setItem(key, encrypted);
  } catch {
    // ignore
  }
};

export const loadFromStorage = (key: string, passphrase?: string): string => {
  if (typeof window === 'undefined') return '';
  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return '';
    return decrypt(encrypted, passphrase);
  } catch {
    return '';
  }
};

export const clearStorage = (key: string) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};
