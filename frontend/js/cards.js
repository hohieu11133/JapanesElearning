import { state } from './state.js';
import { apiFetch } from './api.js';
import { esc, formatDate, openModal, closeModal, showToast, showError, showConfirm, v } from './utils.js';
import { speakWord } from './tts.js';

export async function loadAllCards(deckId) {
  const tbody = document.getElementById('cards-tbody');
  tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Loading…</td></tr>';
  try {
    const cards = await apiFetch(`/api/decks/${deckId}/cards`);
    state.currentCards = cards;
    renderAllCardsTable(cards);
    // Update deck count in state
    const deck = state.decks.find(d => d.id === deckId);
    if (deck) deck.cardCount = cards.length;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:var(--error)">${esc(err.message)}</td></tr>`;
  }
}

export function renderAllCardsTable(cards) {
  const tbody = document.getElementById('cards-tbody');
  if (!cards.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No cards yet.<br>
      <small style="color:var(--outline);display:block;margin-top:.5rem">Add cards one by one or use ⬆ Import to add many at once.</small></td></tr>`;
    return;
  }
  tbody.innerHTML = cards.map(c => `
    <tr id="card-row-${c.id}">
      <td class="td-kanji">
        ${esc(c.kanji)}
        <button class="btn-icon" style="font-size:.9rem;vertical-align:middle;margin-left:.25rem" onclick="speakWord('${esc(c.kanji)}')" title="Pronounce">🔊</button>
      </td>
      <td class="td-reading">${esc(c.reading)}</td>
      <td>${esc(c.meaning)}</td>
      <td class="td-example" title="${esc(c.exampleSentence || '')}">${esc(c.exampleSentence || '—')}</td>
      <td class="td-date">${formatDate(c.nextReviewDate)}</td>
      <td class="td-interval"><span>${c.interval}d</span></td>
      <td><div class="td-actions">
        <button class="btn-icon" onclick="openEditCardModal(${c.id})" title="Edit">✏</button>
        <button class="btn-icon danger" onclick="confirmDeleteCard(${c.id},'${esc(c.kanji)}')" title="Delete">🗑</button>
      </div></td>
    </tr>`).join('');
}

// ═══════════════════════════════════════════════════════════ ADD CARD ══════════

export function openAddCardModal() {
  ['card-kanji-input', 'card-reading-input', 'card-meaning-input', 'card-example-input'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('add-card-error').classList.add('hidden');
  openModal('modal-add-card');
  setTimeout(() => document.getElementById('card-kanji-input').focus(), 50);
}

export async function handleAddCard(e) {
  e.preventDefault();
  const errEl = document.getElementById('add-card-error');
  errEl.classList.add('hidden');
  try {
    await apiFetch(`/api/decks/${state.currentDeckId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ kanji: v('card-kanji-input'), reading: v('card-reading-input'), meaning: v('card-meaning-input'), exampleSentence: v('card-example-input') || null }),
    });
    closeModal('modal-add-card');
    showToast('Card added!', 'success');
    await loadAllCards(state.currentDeckId);
  } catch (err) { showError(errEl, err.message); }
}

// ═══════════════════════════════════════════════════════════ EDIT CARD ═════════

export function openEditCardModal(cardId) {
  const card = state.currentCards.find(c => c.id === cardId);
  if (!card) return;
  document.getElementById('edit-card-id').value = cardId;
  document.getElementById('edit-card-kanji').value = card.kanji;
  document.getElementById('edit-card-reading').value = card.reading;
  document.getElementById('edit-card-meaning').value = card.meaning;
  document.getElementById('edit-card-example').value = card.exampleSentence || '';
  document.getElementById('edit-card-error').classList.add('hidden');
  openModal('modal-edit-card');
  setTimeout(() => document.getElementById('edit-card-kanji').focus(), 50);
}

export async function handleEditCard(e) {
  e.preventDefault();
  const errEl = document.getElementById('edit-card-error');
  errEl.classList.add('hidden');
  const cardId = parseInt(document.getElementById('edit-card-id').value);
  try {
    const updated = await apiFetch(`/api/decks/${state.currentDeckId}/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify({ kanji: v('edit-card-kanji'), reading: v('edit-card-reading'), meaning: v('edit-card-meaning'), exampleSentence: v('edit-card-example') || null }),
    });
    const idx = state.currentCards.findIndex(c => c.id === cardId);
    if (idx !== -1) state.currentCards[idx] = updated;
    closeModal('modal-edit-card');
    renderAllCardsTable(state.currentCards);
    showToast('Card updated!', 'success');
  } catch (err) { showError(errEl, err.message); }
}

// ═══════════════════════════════════════════════════════════ DELETE CARD ════════

export function confirmDeleteCard(cardId, kanji) {
  showConfirm('🗑', 'Delete Card?', `"${kanji}" will be permanently removed.`, 'Delete', async () => {
    try {
      await apiFetch(`/api/decks/${state.currentDeckId}/cards/${cardId}`, { method: 'DELETE' });
      state.currentCards = state.currentCards.filter(c => c.id !== cardId);
      renderAllCardsTable(state.currentCards);
      const deck = state.decks.find(d => d.id === state.currentDeckId);
      if (deck) deck.cardCount = state.currentCards.length;
      showToast('Card deleted.', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });
}
