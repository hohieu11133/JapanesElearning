import { apiFetch } from './api.js';
import { v, showError, showToast, confirmDialog, closeModal } from './utils.js';

let adminUsers = [];
let adminDocs = [];

// ═══════════════════════════════════════════════════════════ TABS ════════════

export function switchAdminTab(tab) {
  const usersTab = document.getElementById('admin-tab-users');
  const docsTab = document.getElementById('admin-tab-docs');
  const usersContent = document.getElementById('admin-content-users');
  const docsContent = document.getElementById('admin-content-docs');

  if (tab === 'users') {
    usersTab.classList.add('active');
    docsTab.classList.remove('active');
    usersContent.classList.remove('hidden');
    docsContent.classList.add('hidden');
    renderAdminUsers();
  } else {
    docsTab.classList.add('active');
    usersTab.classList.remove('active');
    docsContent.classList.remove('hidden');
    usersContent.classList.add('hidden');
    renderSystemDocuments();
  }
}

// ═══════════════════════════════════════════════════════════ USERS ═══════════

export async function renderAdminUsers() {
  const tbody = document.getElementById('admin-users-tbody');
  tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Loading users…</td></tr>`;
  try {
    adminUsers = await apiFetch('/api/admin/users');
    tbody.innerHTML = '';
    if (adminUsers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No users found.</td></tr>`;
      return;
    }

    adminUsers.forEach(u => {
      const tr = document.createElement('tr');
      const roleColor = u.role === 'Admin' ? 'var(--brand-red)' : (u.role === 'Teacher' ? 'var(--on-surface)' : 'var(--tertiary)');
      tr.innerHTML = `
        <td class="font-medium">${u.username}</td>
        <td class="text-tertiary">${u.email}</td>
        <td>
          <select class="field-input" style="padding: 2px 8px; font-size: 12px; width: auto; color: ${roleColor}; border-color: ${roleColor};" onchange="updateUserRole(${u.id}, this.value)">
            <option value="User" ${u.role === 'User' ? 'selected' : ''}>User</option>
            <option value="Teacher" ${u.role === 'Teacher' ? 'selected' : ''}>Teacher</option>
            <option value="Admin" ${u.role === 'Admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td class="text-right">
          <button class="btn-ghost" style="color: var(--error);" onclick="deleteUser(${u.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state text-error">${err.message}</td></tr>`;
  }
}

window.updateUserRole = async function(userId, newRole) {
  try {
    await apiFetch(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ newRole })
    });
    showToast(`Role updated to ${newRole}`);
    renderAdminUsers();
  } catch (err) {
    showToast(err.message, 'error');
    renderAdminUsers(); // reset select
  }
};

window.deleteUser = async function(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    await apiFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    showToast('User deleted');
    renderAdminUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ═══════════════════════════════════════════════════════════ DOCUMENTS (ADMIN) 

export async function renderSystemDocuments() {
  const tbody = document.getElementById('admin-docs-tbody');
  tbody.innerHTML = `<tr><td colspan="4" class="empty-state">Loading documents…</td></tr>`;
  try {
    adminDocs = await apiFetch('/api/documents');
    tbody.innerHTML = '';
    if (adminDocs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state">No documents found.</td></tr>`;
      return;
    }

    adminDocs.forEach(d => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="font-medium">${d.title}</td>
        <td class="text-tertiary">${new Date(d.createdAt).toLocaleDateString()}</td>
        <td class="text-tertiary">${new Date(d.updatedAt).toLocaleDateString()}</td>
        <td class="text-right">
          <button class="btn-ghost" onclick="editAdminDoc(${d.id})">Edit</button>
          <button class="btn-ghost" style="color: var(--error);" onclick="deleteAdminDoc(${d.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-state text-error">${err.message}</td></tr>`;
  }
}

export function openAdminDocModal() {
  document.getElementById('admin-doc-id').value = '';
  document.getElementById('admin-doc-title').value = '';
  document.getElementById('admin-doc-content').value = '';
  document.getElementById('admin-doc-error').classList.add('hidden');
  document.getElementById('modal-admin-doc').classList.remove('hidden');
}

window.editAdminDoc = function(docId) {
  const doc = adminDocs.find(d => d.id === docId);
  if (!doc) return;
  document.getElementById('admin-doc-id').value = doc.id;
  document.getElementById('admin-doc-title').value = doc.title;
  document.getElementById('admin-doc-content').value = doc.content;
  document.getElementById('admin-doc-error').classList.add('hidden');
  document.getElementById('modal-admin-doc').classList.remove('hidden');
};

export async function handleAdminSaveDoc(e) {
  e.preventDefault();
  const id = v('admin-doc-id');
  const title = v('admin-doc-title');
  const content = v('admin-doc-content');
  const errEl = document.getElementById('admin-doc-error');
  errEl.classList.add('hidden');

  try {
    if (id) {
      await apiFetch(`/api/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content })
      });
      showToast('Document updated');
    } else {
      await apiFetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({ title, content })
      });
      showToast('Document created');
    }
    closeModal('modal-admin-doc');
    renderSystemDocuments();
  } catch (err) {
    showError(errEl, err.message);
  }
}

window.deleteAdminDoc = async function(docId) {
  if (!confirm('Are you sure you want to delete this document?')) return;
  try {
    await apiFetch(`/api/documents/${docId}`, { method: 'DELETE' });
    showToast('Document deleted');
    renderSystemDocuments();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ═══════════════════════════════════════════════════════════ DOCUMENTS VIEWER

export async function renderDocumentsPage() {
  const listContainer = document.getElementById('docs-list-container');
  const detailPanel = document.getElementById('docs-detail-panel');
  const docDetailsActive = document.getElementById('doc-details-active');
  const docDetailsEmpty = document.getElementById('doc-details-empty');

  listContainer.innerHTML = `<div class="empty-state">Loading documents…</div>`;
  docDetailsActive.classList.add('hidden');
  docDetailsEmpty.classList.remove('hidden');

  try {
    const docs = await apiFetch('/api/documents');
    listContainer.innerHTML = '';
    
    if (docs.length === 0) {
      listContainer.innerHTML = `<div class="empty-state">No documents available.</div>`;
      return;
    }

    docs.forEach(doc => {
      const el = document.createElement('div');
      el.className = 'deck-card';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <h3 class="deck-title">${doc.title}</h3>
        <p class="deck-desc">Updated: ${new Date(doc.updatedAt).toLocaleDateString()}</p>
      `;
      el.onclick = () => {
        document.querySelectorAll('#docs-list-container .deck-card').forEach(c => c.style.borderColor = 'var(--surface-variant)');
        el.style.borderColor = 'var(--brand-red)';
        
        document.getElementById('doc-view-title').textContent = doc.title;
        document.getElementById('doc-view-date').textContent = `Last Updated: ${new Date(doc.updatedAt).toLocaleDateString()}`;
        
        // Parse markdown content
        document.getElementById('doc-view-content').innerHTML = window.marked ? marked.parse(doc.content) : doc.content;
        
        docDetailsEmpty.classList.add('hidden');
        docDetailsActive.classList.remove('hidden');
      };
      listContainer.appendChild(el);
    });

    // Auto select first document
    if (docs.length > 0) {
      listContainer.firstChild.click();
    }
  } catch (err) {
    listContainer.innerHTML = `<div class="empty-state text-error">${err.message}</div>`;
  }
}
