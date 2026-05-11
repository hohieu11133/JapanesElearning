import { state } from './state.js';

export const API = window.location.protocol === 'file:' || ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port !== '5000') 
  ? 'http://localhost:5000' 
  : window.location.origin;

// ═══════════════════════════════════════════════════ API HELPERS ═════════════

export async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  const res = await fetch(API + path, { ...opts, headers });
  if (res.status === 204) return null;
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    const msg = data?.message || data?.title || (typeof data === 'string' ? data : `Error ${res.status}`);
    throw new Error(msg);
  }
  return data;
}
