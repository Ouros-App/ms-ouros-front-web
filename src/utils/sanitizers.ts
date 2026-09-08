import DOMPurify from 'dompurify';

export const sanitizeHtml = (v: string) =>
  DOMPurify.sanitize(v, { USE_PROFILES: { html: true } });

export const sanitizeText = (v: string) => DOMPurify.sanitize(v, { ALLOWED_TAGS: [] });
