import { state } from './state.js';
import { apiFetch } from './api.js';
import { esc, showToast, showError, showConfirm, openModal, closeModal, v } from './utils.js';
import { showView } from './main.js';
import { loadAllCards } from './cards.js';
import { startStudyForDeck } from './study.js';
import { drawHeatmap, updateDonutChart, renderWeeklyOutlook } from './stats.js';

export async function loadDecks() {
  try { state.decks = await apiFetch('/api/decks') || []; }
  catch (err) { console.error('loadDecks:', err); state.decks = []; }
}

export async function loadDashboardStats() {
  try {
    const stats = await apiFetch('/api/study/stats');
    const dueEl = document.getElementById('stat-due');
    const streakEl = document.getElementById('stat-streak');
    const totalEl = document.getElementById('stat-total');
    const decksEl = document.getElementById('stat-decks');
    if (dueEl) dueEl.textContent = stats.dueToday;
    if (streakEl) streakEl.textContent = `🔥 ${stats.dayStreak}`;
    if (totalEl) totalEl.textContent = stats.totalCards;
    if (decksEl) decksEl.textContent = stats.activeDecks;
  } catch (err) {
    console.error('loadDashboardStats:', err);
  }
}

export async function renderDashboard() {
  const total = state.decks.reduce((s, d) => s + (d.cardCount || 0), 0);
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-decks').textContent = state.decks.length;
  document.getElementById('stat-due').textContent = '–';

  // Load detailed stats for heatmap
  let heatmapData = [];
  try {
    const detailed = await apiFetch('/api/study/detailed-stats');
    if (detailed && detailed.heatmap) {
      heatmapData = detailed.heatmap;
    }
  } catch (e) {
    console.error('loadDashboard heatmap:', e);
  }

  // Render dashboard heatmap (3 months) using real logs
  drawHeatmap('dash-heatmap-grid', 3, heatmapData);

  const grid = document.getElementById('dash-deck-grid');
  if (!state.decks.length) {
    grid.innerHTML = `<div class="empty-state">No decks yet. <a href="#" onclick="showView('decks')" style="color:var(--primary)">Create one →</a></div>`;
    updateDonutChart('donut', 0, 0, 0);
    return;
  }
  grid.innerHTML = state.decks.slice(0, 4).map(d => deckCardHTML(d, true)).join('');
  loadDashboardStats();

  // Load all cards to get the donut chart stats and weekly forecast
  try {
    const allDecksCards = await Promise.all(state.decks.map(async (d) => {
      try { return await apiFetch(`/api/decks/${d.id}/cards`) || []; }
      catch { return []; }
    }));
    const allCards = allDecksCards.flat();
    const masteredCount = allCards.filter(c => c.repetitions >= 4).length;
    const learningCount = allCards.filter(c => c.repetitions > 0 && c.repetitions < 4).length;
    const totalCount = allCards.length;

    updateDonutChart('donut', masteredCount, learningCount, totalCount);
    renderWeeklyOutlook('outlook-bar-wrap', allCards);
  } catch (e) {
    console.error('loadDashboard charts:', e);
  }
}

export function renderDecksPage() {
  const container = document.getElementById('decks-list-container');
  if (!container) return;

  const searchQuery = (document.getElementById('deck-search-input')?.value || '').toLowerCase().trim();
  const filterMode = state.deckFilter || 'all';

  let filteredDecks = state.decks;

  if (searchQuery) {
    filteredDecks = filteredDecks.filter(d => d.title.toLowerCase().includes(searchQuery));
  }

  if (filterMode === 'due') {
    filteredDecks = filteredDecks.filter(d => (d.dueCount || 0) > 0);
  } else if (filterMode === 'fav') {
    // Show decks where ID is even as "favorites" for visual premium simulation
    filteredDecks = filteredDecks.filter(d => d.id % 2 === 0);
  }

  if (!filteredDecks.length) {
    container.innerHTML = `<div class="empty-state" style="padding: 2rem 1rem; font-size: 0.8rem;">No decks found</div>`;
    document.getElementById('deck-details-empty').classList.remove('hidden');
    document.getElementById('deck-details-active').classList.add('hidden');
    return;
  }

  container.innerHTML = filteredDecks.map(d => {
    const isDue = (d.dueCount || 0) > 0;
    const activeClass = state.currentDeckId === d.id ? 'active' : '';
    const badgeHTML = isDue 
      ? `<span class="split-deck-badge due">${d.dueCount} due</span>`
      : `<span class="split-deck-badge ok">Clean</span>`;

    return `
      <div class="split-deck-item ${activeClass}" id="deck-item-${d.id}" onclick="openDeck(${d.id})">
        <div class="split-deck-title-row">
          <span class="split-deck-title">${esc(d.title)}</span>
          <span class="split-deck-tag">${d.title.substring(0,1).toUpperCase()}</span>
        </div>
        <div class="split-deck-meta">${d.cardCount} card${d.cardCount !== 1 ? 's' : ''}</div>
        <div class="split-deck-badges">
          ${badgeHTML}
        </div>
      </div>
    `;
  }).join('');

  if (state.currentDeckId && state.decks.some(d => d.id === state.currentDeckId)) {
    const activePanel = document.getElementById('deck-details-active');
    if (activePanel && activePanel.classList.contains('hidden')) {
      openDeck(state.currentDeckId);
    }
  } else {
    document.getElementById('deck-details-empty').classList.remove('hidden');
    document.getElementById('deck-details-active').classList.add('hidden');
  }
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
    renderDecksPage();
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
        if (state.currentDeckId === deckId) { 
          state.currentDeckId = null; 
        }
        renderDecksPage();
        showToast('Deck deleted.', 'success');
      } catch (err) { showToast(err.message, 'error'); }
    }
  );
}

// ── Open Deck (card list) ─────────────────────────────────────────────────────
export async function openDeck(deckId) {
  state.currentDeckId = deckId;
  
  // Navigate to Decks split view if not already there
  const decksView = document.getElementById('view-decks');
  if (decksView && decksView.classList.contains('hidden')) {
    showView('decks');
  }

  // Update selected state in sidebar
  document.querySelectorAll('.split-deck-item').forEach(item => {
    item.classList.remove('active');
  });
  const activeItem = document.getElementById(`deck-item-${deckId}`);
  if (activeItem) activeItem.classList.add('active');

  // Display details panel
  document.getElementById('deck-details-empty').classList.add('hidden');
  document.getElementById('deck-details-active').classList.remove('hidden');

  const deck = state.decks.find(d => d.id === deckId);
  if (!deck) return;

  document.getElementById('cards-deck-title').textContent = deck.title;
  document.getElementById('cards-deck-subtitle').textContent = `Vocabulary Deck · N5`;
  document.getElementById('deck-created-tag').textContent = `Created ${new Date(deck.createdAt).toLocaleDateString()}`;
  document.getElementById('deck-tag-count').textContent = deck.title.substring(0, 1).toUpperCase();

  // Load all cards
  await loadAllCards(deckId);

  // Compute progress bar & stats
  const cards = state.currentCards || [];
  const total = cards.length;
  const mastered = cards.filter(c => c.repetitions >= 4).length;
  const learning = cards.filter(c => c.repetitions > 0 && c.repetitions < 4).length;

  const progressPct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  document.getElementById('deck-progress-pct').textContent = `${progressPct}% Mastered (${mastered}/${total})`;

  const masteredPct = total > 0 ? (mastered / total) * 100 : 0;
  const learningPct = total > 0 ? (learning / total) * 100 : 0;

  document.getElementById('deck-progress-mastered').style.width = `${masteredPct}%`;
  document.getElementById('deck-progress-learning').style.width = `${learningPct}%`;

  // Calculate Next Review Date
  let nextReviewStr = 'No reviews scheduled';
  if (total > 0) {
    const dueCards = cards.filter(c => new Date(c.nextReviewDate) <= new Date());
    if (dueCards.length > 0) {
      nextReviewStr = `${dueCards.length} card${dueCards.length !== 1 ? 's' : ''} due now`;
    } else {
      const dates = cards.map(c => new Date(c.nextReviewDate)).sort((a,b) => a - b);
      nextReviewStr = dates[0].toLocaleDateString() + ' ' + dates[0].toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  document.getElementById('deck-next-review-val').textContent = nextReviewStr;

  // Calculate Avg accuracy
  let avgAccuracy = '100%';
  if (total > 0) {
    const avgReps = cards.reduce((acc, c) => acc + c.repetitions, 0) / total;
    const accVal = Math.min(100, Math.round(75 + avgReps * 5));
    avgAccuracy = `${accVal}% accuracy`;
  }
  document.getElementById('deck-avg-perf-val').textContent = avgAccuracy;
  document.getElementById('deck-cards-count-title').textContent = `All Cards (${total})`;

  // Apply default sorting
  sortActiveDeckCards();
}

export function setDeckFilter(filterMode) {
  state.deckFilter = filterMode;
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  const activeTab = document.getElementById(`deck-filter-${filterMode === 'all' ? 'all' : filterMode === 'due' ? 'due' : 'fav'}`);
  if (activeTab) activeTab.classList.add('active');
  renderDecksPage();
}

export function filterDecksList() {
  renderDecksPage();
}

export function sortActiveDeckCards() {
  const sortBy = document.getElementById('card-sort-select')?.value || 'due';
  const cards = state.currentCards || [];
  
  if (sortBy === 'kanji') {
    cards.sort((a, b) => a.kanji.localeCompare(b.kanji));
  } else if (sortBy === 'due') {
    cards.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));
  } else if (sortBy === 'interval') {
    cards.sort((a, b) => a.interval - b.interval);
  }

  renderAllCardsTable(cards);
}

function renderAllCardsTable(cards) {
  const tbody = document.getElementById('cards-tbody');
  if (!tbody) return;
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
      <td class="td-date">${new Date(c.nextReviewDate).toLocaleDateString()}</td>
      <td class="td-interval"><span>${c.interval}d</span></td>
      <td><div class="td-actions">
        <button class="btn-icon" onclick="openEditCardModal(${c.id})" title="Edit">✏</button>
        <button class="btn-icon danger" onclick="confirmDeleteCard(${c.id},'${esc(c.kanji)}')" title="Delete">🗑</button>
      </div></td>
    </tr>`).join('');
}

// Expose globals for HTML event handlers
window.openDeck = openDeck;
window.setDeckFilter = setDeckFilter;
window.filterDecksList = filterDecksList;
window.sortActiveDeckCards = sortActiveDeckCards;
