import { state } from './state.js';
import { apiFetch } from './api.js';
import { v, setLoading, showError } from './utils.js';
import { bootApp } from './main.js';

export function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
}

export async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-login');
  const errEl = document.getElementById('login-error');
  setLoading(btn, true);
  errEl.classList.add('hidden');
  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: v('login-email'), password: v('login-password') }),
    });
    persistAuth(data);
    startSessionTimer();
    bootApp();
  } catch (err) { showError(errEl, err.message); }
  finally { setLoading(btn, false); }
}

export async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-register');
  const errEl = document.getElementById('register-error');
  setLoading(btn, true);
  errEl.classList.add('hidden');
  try {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username: v('reg-username'), email: v('reg-email'), password: v('reg-password') }),
    });
    persistAuth(data);
    startSessionTimer();
    bootApp();
  } catch (err) { showError(errEl, err.message); }
  finally { setLoading(btn, false); }
}

export function persistAuth(data) {
  state.token = data.token;
  state.user = { username: data.username, email: data.email, role: data.role };
  localStorage.setItem('jpe_token', data.token);
  localStorage.setItem('jpe_user', JSON.stringify(state.user));
}

let sessionTimeoutId = null;

export function handleLogout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('jpe_token');
  localStorage.removeItem('jpe_user');
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
  document.getElementById('page-app').classList.add('hidden');
  document.getElementById('page-auth').classList.remove('hidden');
  document.getElementById('page-auth').classList.add('active');
}

function getJwtExpiry(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    return payload.exp ? payload.exp * 1000 : null;
  } catch (e) {
    return null;
  }
}

export function startSessionTimer() {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
  if (!state.token) return;
  const expiry = getJwtExpiry(state.token);
  if (!expiry) return;
  const remaining = expiry - Date.now();
  if (remaining <= 0) {
    handleLogout();
    import('./utils.js').then(({ showToast }) => {
      showToast('Session expired. Please log in again.', 'error');
    });
  } else {
    sessionTimeoutId = setTimeout(() => {
      handleLogout();
      import('./utils.js').then(({ showToast }) => {
        showToast('Session expired. Please log in again.', 'error');
      });
    }, remaining);
  }
}
