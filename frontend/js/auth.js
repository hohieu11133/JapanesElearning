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
    persistAuth(data); bootApp();
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
    persistAuth(data); bootApp();
  } catch (err) { showError(errEl, err.message); }
  finally { setLoading(btn, false); }
}

export function persistAuth(data) {
  state.token = data.token;
  state.user = { username: data.username, email: data.email };
  localStorage.setItem('jpe_token', data.token);
  localStorage.setItem('jpe_user', JSON.stringify(state.user));
}

export function handleLogout() {
  state.token = null; state.user = null;
  localStorage.removeItem('jpe_token'); localStorage.removeItem('jpe_user');
  document.getElementById('page-app').classList.add('hidden');
  document.getElementById('page-auth').classList.remove('hidden');
  document.getElementById('page-auth').classList.add('active');
}
