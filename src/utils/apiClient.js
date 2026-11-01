const developmentBackend = import.meta.env.DEV && typeof window !== 'undefined'
  ? `http://${window.location.hostname}:8000`
  : '';
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || developmentBackend).replace(/\/+$/, '');

let csrfToken = '';

function requireApiBase() {
  if (!API_BASE) throw new Error('Backend service is not configured. Set VITE_API_BASE_URL to the backend URL.');
  return API_BASE;
}

async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${requireApiBase()}/auth/csrf`, { credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.csrf_token) throw new Error(data.detail || 'Could not initialize a secure session.');
  csrfToken = data.csrf_token;
  return csrfToken;
}

export async function apiFetch(path, options = {}) {
  const base = requireApiBase();
  const method = (options.method || 'GET').toUpperCase();
  const headers = new Headers(options.headers || {});
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && !headers.has('Authorization')) {
    headers.set('X-CSRF-Token', await getCsrfToken());
  }
  const { token: _token, ...fetchOptions } = options;
  const url = /^https?:\/\//i.test(path) ? path : `${base}${path}`;
  return fetch(url, { ...fetchOptions, method, headers, credentials: 'include' });
}

export async function readApiError(response, fallback = 'The request failed.') {
  const body = await response.json().catch(() => ({}));
  if (Array.isArray(body.detail)) {
    return body.detail.map(item => item.msg).filter(Boolean).join(' ');
  }
  return body.detail || body.message || fallback;
}
