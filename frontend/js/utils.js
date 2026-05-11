import { state } from './state.js';

export function v(id) { return document.getElementById(id)?.value?.trim() || ''; }

export function setLoading(btn, loading) {
  btn.disabled = loading;
  const span = btn.querySelector('span');
  if (span) span.textContent = loading ? 'Loading…' : (btn.dataset.label || span.textContent);
}

export function showError(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }

let _toastTimer;
export function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.className = `toast ${type}`; t.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.add('hidden'), 3800);
}

export function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso), now = new Date();
  const diff = Math.round((d - now) / 86400000);
  if (diff <= 0) return '🔴 Due now';
  if (diff === 1) return '🟡 Tomorrow';
  if (diff < 7) return `In ${diff} days`;
  return d.toLocaleDateString();
}

export function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
export function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

export function showConfirm(icon, title, body, btnText, callback) {
  document.getElementById('confirm-icon').textContent = icon;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-body').textContent = body;
  const btn = document.getElementById('btn-confirm-action');
  btn.textContent = btnText;
  state.confirmCallback = callback;
  openModal('modal-confirm');
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn-confirm-action');
  if (btn) btn.addEventListener('click', () => {
    closeModal('modal-confirm');
    if (typeof state.confirmCallback === 'function') state.confirmCallback();
    state.confirmCallback = null;
  });
});
