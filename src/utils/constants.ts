export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Ouros';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const rawAuthUrl = import.meta.env.VITE_AUTH_API_URL ?? (import.meta.env.DEV ? '' : 'http://localhost:8000');
export const AUTH_API_URL = rawAuthUrl.replace(/\/+$/, '');
export const STORAGE_VERSION = import.meta.env.VITE_STORAGE_VERSION || 'v1';
