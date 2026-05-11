import { state } from './state.js';
import { apiFetch } from './api.js';
import { esc, showToast, showError, showConfirm, openModal, closeModal, v } from './utils.js';
import { showView } from './main.js';
import { loadAllCards } from './cards.js';
import { startStudyForDeck } from './study.js';

export async function loadDecks() {
  try { state.decks = await apiFetch('/api/decks') || []; }
  catch (err) { console.error('loadDecks:', err); state.decks = []; }
}

export function renderDashboard() {
  const total = state.decks.reduce((s, d) => s + (d.cardCount || 0), 0);
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-decks').textContent = state.decks.length;
  document.getElementById('stat-due').textContent = '–';

  const grid = document.getElementById('dash-deck-grid');
  if (!state.decks.length) {
    grid.innerHTML = `<div class="empty-state">No decks yet. <a href="#" onclick="showView('decks')" style="color:var(--primary)">Create one →</a></div>`;
    return;
  }
  grid.innerHTML = state.decks.slice(0, 4).map(d => deckCardHTML(d, true)).join('');
}

export function renderDecksPage() {
  const grid = document.getElementById('decks-grid');
  if (!state.decks.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">No decks yet — create your first one!</div>`;
    return;
  }
  grid.innerHTML = state.decks.map(d => deckCardHTML(d, false)).join('');
}

export function deckCardHTML(deck, compact) {
  return `
    <div class="deck-card" onclick="openDeck(${deck.id})">
      <div class="deck-card-title">${esc(deck.title)}</div>
      <div class="deck-card-count">${deck.cardCount} card${deck.cardCount !== 1 ? 's' : ''}</div>
      <div class="deck-card-subtitle">Created ${new Date(deck.createdAt).toLocaleDateString()}</div>
      ${!compact ? `
      <div class="deck-card-actions">
        <button class="btn-accent" style="font-size:.78rem;padding:.4rem .9rem" onclick="event.stopPropagation();startStudyForDeck(${deck.id})">▶ Study</button>
        <button class="btn-ghost btn-sm" onclick="event.stopPropagation();openDeck(${deck.id})">Cards →</button>
        <button class="btn-icon danger" onclick="event.stopPropagation();confirmDeleteDeckById(${deck.id},'${esc(deck.title)}')" title="Delete deck">🗑</button>
      </div>` : ''}
    </div>`;
}

// ── Create Deck ───────────────────────────────────────────────────────────────
export function openCreateDeckModal() {
  document.getElementById('new-deck-title').value = '';
  document.getElementById('create-deck-error').classList.add('hidden');
  openModal('modal-create-deck');
  setTimeout(() => document.getElementById('new-deck-title').focus(), 50);
}

export async function handleCreateDeck(e) {
  e.preventDefault();
  const errEl = document.getElementById('create-deck-error');
  errEl.classList.add('hidden');
  try {
    const deck = await apiFetch('/api/decks', { method: 'POST', body: JSON.stringify({ title: v('new-deck-title') }) });
    state.decks.unshift(deck);
    closeModal('modal-create-deck');
    renderDecksPage();
    showToast('Deck created!', 'success');
  } catch (err) { showError(errEl, err.message); }
}

// ── Edit Deck ─────────────────────────────────────────────────────────────────
export function openEditDeckModal() {
  const deck = state.decks.find(d => d.id === state.currentDeckId);
  if (!deck) return;
  document.getElementById('edit-deck-title').value = deck.title;
  document.getElementById('edit-deck-error').classList.add('hidden');
  openModal('modal-edit-deck');
  setTimeout(() => document.getElementById('edit-deck-title').focus(), 50);
}

export async function handleEditDeck(e) {
  e.preventDefault();
  const errEl = document.getElementById('edit-deck-error');
  errEl.classList.add('hidden');
  try {
    const updated = await apiFetch(`/api/decks/${state.currentDeckId}`, {
      method: 'PUT', body: JSON.stringify({ title: v('edit-deck-title') }),
    });
    const idx = state.decks.findIndex(d => d.id === state.currentDeckId);
    if (idx !== -1) state.decks[idx] = { ...state.decks[idx], title: updated.title };
    document.getElementById('cards-deck-title').textContent = updated.title;
    closeModal('modal-edit-deck');
    showToast('Deck renamed!', 'success');
  } catch (err) { showError(errEl, err.message); }
}

// ── Delete Deck ───────────────────────────────────────────────────────────────
export function confirmDeleteDeck() {
  const deck = state.decks.find(d => d.id === state.currentDeckId);
  if (deck) confirmDeleteDeckById(deck.id, deck.title);
}

export function confirmDeleteDeckById(deckId, title) {
  showConfirm(
    '🗑',
    'Delete Deck?',
    `"${title}" and all its cards will be permanently deleted.`,
    'Delete Deck',
    async () => {
      try {
        await apiFetch(`/api/decks/${deckId}`, { method: 'DELETE' });
        state.decks = state.decks.filter(d => d.id !== deckId);
        if (state.currentDeckId === deckId) { state.currentDeckId = null; showView('decks'); }
        else renderDecksPage();
        showToast('Deck deleted.', 'success');
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}

// ── Open Deck (card list) ─────────────────────────────────────────────────────
export async function openDeck(deckId) {
  state.currentDeckId = deckId;
  const deck = state.decks.find(d => d.id === deckId);
  document.getElementById('cards-deck-title').textContent = deck ? deck.title : 'Deck';
  showView('cards');
  await loadAllCards(deckId);
}
