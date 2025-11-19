const STORAGE_KEY = 'userInfo';

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage || window.localStorage;
  } catch {
    return null;
  }
};

const normalizeBase64 = (segment = '') => {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padding = 4 - (normalized.length % 4 || 4);
  return normalized.padEnd(normalized.length + padding % 4, '=');
};

const decodeJwt = (token) => {
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Invalid token structure');
  }

  const payloadSegment = normalizeBase64(parts[1]);
  const payload = atob(payloadSegment);
  return JSON.parse(decodeURIComponent(payload.split('').map((c) => {
    const hex = c.charCodeAt(0).toString(16).padStart(2, '0');
    return `%${hex}`;
  }).join('')));
};

export const getStoredAuth = () => {
  try {
    const storage = getStorage();
    if (!storage) return null;

    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const token = parsed?.token || parsed?.data?.token || null;
    const user =
      parsed?.user ||
      parsed?.data?.user ||
      (token ? parsed : null);

    if (!token || !user) return null;

    return { token, user };
  } catch (error) {
    console.warn('Stored auth parse error:', error);
    return null;
  }
};

export const saveAuth = (payload) => {
  const storage = getStorage();
  if (!payload || !storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const clearStoredAuth = () => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
};

export const isTokenValid = (token) => {
  if (!token) return false;

  try {
    const payload = decodeJwt(token);
    if (!payload?.exp) return false;

    // Allow 30s clock skew
    const now = Date.now() / 1000;
    return payload.exp - 30 > now;
  } catch (error) {
    console.warn('Token decode error:', error);
    return false;
  }
};

export const hasPermission = (user, required = []) => {
  if (!required || required.length === 0) return true;
  if (!user) return false;

  const userPermissions = Array.isArray(user.roles) ? user.roles : [];
  return required.every((perm) => userPermissions.includes(perm));
};

export const getUserOrRedirect = () => {
  const auth = getStoredAuth();
  return auth?.user || null;
};

