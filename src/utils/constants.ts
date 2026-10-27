export const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Ouros';
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Em desenvolvimento, o proxy do Vite (/v1/auth) evita CORS com a API remota
const rawAuthUrl = import.meta.env.DEV
  ? (import.meta.env.VITE_FORCE_DIRECT_AUTH === 'true'
      ? (import.meta.env.VITE_AUTH_API_URL || 'https://ms-auth-service.discloud.app')
      : '')
  : (import.meta.env.VITE_AUTH_API_URL || 'https://ms-auth-service.discloud.app');

export const AUTH_API_URL = rawAuthUrl.replace(/\/+$/, '');
export const STORAGE_VERSION = import.meta.env.VITE_STORAGE_VERSION || 'v1';
