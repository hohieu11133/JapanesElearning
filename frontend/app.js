// ═══════════════════════════════════════════════════════════════════════════
// JapanE 学 — Application Logic
// API: http://localhost:5000
// ═══════════════════════════════════════════════════════════════════════════

const API = `${window.location.protocol}//${window.location.hostname}:5000`;

// ── Text-to-Speech (Web Speech API) ─────────────────────────────────────────
let _ttsVoice = null;

function initTTS() {
  if (!('speechSynthesis' in window)) return;
  function loadVoices() {
    const voices = window.speechSynthesis.getVoices();
    // Prefer a native Japanese voice; fall back to first available
    _ttsVoice = voices.find(v => v.lang === 'ja-JP' && v.localService)
      || voices.find(v => v.lang === 'ja-JP')
      || voices.find(v => v.lang.startsWith('ja'))
      || null;
  }
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function speakWord(text) {
  if (!text || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); // stop any current speech
  const utt = new SpeechSynthesisUtterance(text.trim());
  utt.lang = 'ja-JP';
  utt.rate = 0.85;   // slightly slower for learning
  utt.pitch = 1;
  if (_ttsVoice) utt.voice = _ttsVoice;

  // Animate the button while speaking
  const btns = document.querySelectorAll('.btn-speak');
  btns.forEach(b => b.classList.add('speaking'));
  utt.onend = utt.onerror = () => btns.forEach(b => b.classList.remove('speaking'));

  window.speechSynthesis.speak(utt);
}

// ── State ────────────────────────────────────────────────────────────────────
const state = {
  token: localStorage.getItem('jpe_token') || null,
  user: JSON.parse(localStorage.getItem('jpe_user') || 'null'),
  decks: [],
  currentDeckId: null,
  currentCards: [],
  studyQueue: [],
  studyIdx: 0,
  reviewedCount: 0,
  studyMode: 'practice',   // 'practice' | 'browse'
  browseCards: [],           // all cards for browse mode
  browseIdx: 0,
  importParsed: [],
  canvas: { drawing: false, tool: 'pen', size: 4 },
  confirmCallback: null,
  _cardRevealed: false,
};

// ═══════════════════════════════════════════════════ API HELPERS ═════════════

async function apiFetch(path, opts = {}) {
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

// ═══════════════════════════════════════════════════════════ AUTH ═════════════

function switchAuthTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
  document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
}

async function handleLogin(e) {
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

async function handleRegister(e) {
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

function persistAuth(data) {
  state.token = data.token;
  state.user = { username: data.username, email: data.email };
  localStorage.setItem('jpe_token', data.token);
  localStorage.setItem('jpe_user', JSON.stringify(state.user));
}

function handleLogout() {
  state.token = null; state.user = null;
  localStorage.removeItem('jpe_token'); localStorage.removeItem('jpe_user');
  document.getElementById('page-app').classList.add('hidden');
  document.getElementById('page-auth').classList.remove('hidden');
  document.getElementById('page-auth').classList.add('active');
}

// ═══════════════════════════════════════════════════════════ APP BOOT ═════════

async function bootApp() {
  document.getElementById('page-auth').classList.add('hidden');
  document.getElementById('page-app').classList.remove('hidden');
  document.getElementById('page-app').classList.add('active');

  const name = state.user?.username || 'Scholar';
  document.getElementById('user-name-display').textContent = name;
  document.getElementById('user-avatar').textContent = name[0].toUpperCase();
  document.getElementById('dash-greeting').textContent = `Good ${getTimeOfDay()}, ${name}`;
  document.getElementById('header-date').textContent =
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  showView('dashboard');
  await loadDecks();
  renderDashboard();
}

function getTimeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
}

// ═══════════════════════════════════════════════════════════ NAVIGATION ════════

function showView(name) {
  document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const view = document.getElementById(`view-${name}`);
  if (view) { view.classList.remove('hidden'); view.classList.add('active'); }
  const nav = document.getElementById(`nav-${name}`);
  if (nav) nav.classList.add('active');

  if (name === 'decks') renderDecksPage();
  if (name === 'stats') renderStatsPage();
}

// ═════════════════════════════════════════════════════════════ DECKS ══════════

async function loadDecks() {
  try { state.decks = await apiFetch('/api/decks') || []; }
  catch (err) { console.error('loadDecks:', err); state.decks = []; }
}

function renderDashboard() {
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

function renderDecksPage() {
  const grid = document.getElementById('decks-grid');
  if (!state.decks.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">No decks yet — create your first one!</div>`;
    return;
  }
  grid.innerHTML = state.decks.map(d => deckCardHTML(d, false)).join('');
}

function deckCardHTML(deck, compact) {
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
function openCreateDeckModal() {
  document.getElementById('new-deck-title').value = '';
  document.getElementById('create-deck-error').classList.add('hidden');
  openModal('modal-create-deck');
  setTimeout(() => document.getElementById('new-deck-title').focus(), 50);
}

async function handleCreateDeck(e) {
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
function openEditDeckModal() {
  const deck = state.decks.find(d => d.id === state.currentDeckId);
  if (!deck) return;
  document.getElementById('edit-deck-title').value = deck.title;
  document.getElementById('edit-deck-error').classList.add('hidden');
  openModal('modal-edit-deck');
  setTimeout(() => document.getElementById('edit-deck-title').focus(), 50);
}

async function handleEditDeck(e) {
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
function confirmDeleteDeck() {
  const deck = state.decks.find(d => d.id === state.currentDeckId);
  if (deck) confirmDeleteDeckById(deck.id, deck.title);
}

function confirmDeleteDeckById(deckId, title) {
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
async function openDeck(deckId) {
  state.currentDeckId = deckId;
  const deck = state.decks.find(d => d.id === deckId);
  document.getElementById('cards-deck-title').textContent = deck ? deck.title : 'Deck';
  showView('cards');
  await loadAllCards(deckId);
}

// ═══════════════════════════════════════════════════════════ ALL CARDS ═════════

async function loadAllCards(deckId) {
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

function renderAllCardsTable(cards) {
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

function openAddCardModal() {
  ['card-kanji-input', 'card-reading-input', 'card-meaning-input', 'card-example-input'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('add-card-error').classList.add('hidden');
  openModal('modal-add-card');
  setTimeout(() => document.getElementById('card-kanji-input').focus(), 50);
}

async function handleAddCard(e) {
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

function openEditCardModal(cardId) {
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

async function handleEditCard(e) {
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

function confirmDeleteCard(cardId, kanji) {
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

// ═══════════════════════════════════════════════════════ BULK IMPORT ══════════

function openImportModal() {
  document.getElementById('import-textarea').value = '';
  document.getElementById('import-file').value = '';
  document.getElementById('import-preview-wrap').classList.add('hidden');
  document.getElementById('import-error').classList.add('hidden');
  document.getElementById('btn-confirm-import').disabled = true;
  document.getElementById('import-btn-count').textContent = '0';
  state.importParsed = [];
  openModal('modal-import');
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('import-textarea').value = ev.target.result;
    onImportTextChange();
  };
  reader.readAsText(file, 'utf-8');
}

function onImportTextChange() {
  const text = document.getElementById('import-textarea').value;
  const { cards, errors } = parseImportText(text);
  state.importParsed = cards;
  previewImportCards(cards, errors);
}

function parseImportText(text) {
  const lines = text.split('\n');
  const cards = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim() || raw.trim().startsWith('#')) continue;

    // Support tab-separated and comma-separated
    let cols = raw.includes('\t') ? raw.split('\t') : raw.split(',');
    cols = cols.map(c => c.trim());

    const [kanji, reading, meaning, example] = cols;
    if (!kanji) { errors.push(`Row ${i + 1}: Kanji is empty.`); continue; }
    if (!meaning) { errors.push(`Row ${i + 1}: Meaning is empty.`); continue; }

    cards.push({ kanji, reading: reading || '', meaning, exampleSentence: example || null });
  }
  return { cards, errors };
}

function previewImportCards(cards, errors = []) {
  const wrap = document.getElementById('import-preview-wrap');
  const body = document.getElementById('import-preview-body');
  const count = document.getElementById('import-preview-count');
  const btn = document.getElementById('btn-confirm-import');
  const errEl = document.getElementById('import-error');

  if (!cards.length) {
    wrap.classList.add('hidden');
    btn.disabled = true;
    document.getElementById('import-btn-count').textContent = '0';
    if (errors.length) showError(errEl, errors.slice(0, 3).join('\n'));
    else errEl.classList.add('hidden');
    return;
  }

  errEl.classList.add('hidden');
  count.textContent = `${cards.length} card${cards.length !== 1 ? 's' : ''} ready to import`;
  if (errors.length) count.textContent += ` (${errors.length} row${errors.length > 1 ? 's' : ''} skipped)`;

  body.innerHTML = cards.slice(0, 30).map((c, i) => `
    <tr>
      <td class="preview-row-num">${i + 1}</td>
      <td class="preview-kanji">${esc(c.kanji)}</td>
      <td>${esc(c.reading)}</td>
      <td>${esc(c.meaning)}</td>
      <td style="color:var(--outline);font-size:.75rem">${esc(c.exampleSentence || '')}</td>
    </tr>`).join('');
  if (cards.length > 30) body.innerHTML += `<tr><td colspan="5" style="text-align:center;color:var(--outline);padding:.5rem">… and ${cards.length - 30} more</td></tr>`;

  wrap.classList.remove('hidden');
  btn.disabled = false;
  document.getElementById('import-btn-count').textContent = cards.length;
}

async function handleConfirmImport() {
  const errEl = document.getElementById('import-error');
  errEl.classList.add('hidden');
  const btn = document.getElementById('btn-confirm-import');
  btn.disabled = true;
  btn.textContent = 'Importing…';

  try {
    const result = await apiFetch(`/api/decks/${state.currentDeckId}/cards/import`, {
      method: 'POST',
      body: JSON.stringify({ cards: state.importParsed }),
    });
    closeModal('modal-import');
    let msg = `✅ Imported ${result.imported} card${result.imported !== 1 ? 's' : ''}`;
    if (result.skipped > 0) msg += ` · ${result.skipped} duplicate${result.skipped > 1 ? 's' : ''} skipped`;
    showToast(msg, 'success');
    await loadAllCards(state.currentDeckId);
  } catch (err) {
    showError(errEl, err.message);
    btn.disabled = false;
    btn.innerHTML = `Import <span id="import-btn-count">${state.importParsed.length}</span> Cards`;
  }
}

// Setup drag-and-drop on import drop zone
function initImportDrop() {
  const zone = document.getElementById('import-drop-zone');
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('import-textarea').value = ev.target.result;
      onImportTextChange();
    };
    reader.readAsText(file, 'utf-8');
  });
}

// ═══════════════════════════════════════════════════════════ STUDY ════════════

// Open mode selection modal
function openStudyModeModal() {
  if (!state.currentDeckId) return;
  openModal('modal-study-mode');
}

// ── Practice (SRS) mode ───────────────────────────────────────────────────────
async function startPractice() {
  closeModal('modal-study-mode');
  const deckId = state.currentDeckId;
  if (!deckId) return;
  try {
    const cards = await apiFetch(`/api/decks/${deckId}/study`);
    if (!cards.length) { showToast('No cards due right now — great job! 🎉', 'success'); return; }
    state.studyMode = 'practice';
    state.studyQueue = cards;
    state.studyIdx = 0;
    state.reviewedCount = 0;
    showStudyView();
    document.getElementById('practice-header').classList.remove('hidden');
    document.getElementById('browse-header').classList.add('hidden');
    document.getElementById('rating-row').classList.add('hidden');
    loadStudyCard();
  } catch (err) { showToast(err.message, 'error'); }
}

// kept for backward compat (dashboard Study button)
async function startStudy() { openStudyModeModal(); }
async function startStudyForDeck(deckId) { state.currentDeckId = deckId; openStudyModeModal(); }

// ── Browse (sequential) mode ──────────────────────────────────────────────────
async function startBrowse() {
  closeModal('modal-study-mode');
  const deckId = state.currentDeckId;
  if (!deckId) return;
  try {
    const cards = await apiFetch(`/api/decks/${deckId}/cards`);
    if (!cards.length) { showToast('This deck has no cards yet.', 'error'); return; }
    state.studyMode = 'browse';
    state.browseCards = cards;
    state.browseIdx = 0;
    showStudyView();
    document.getElementById('practice-header').classList.add('hidden');
    document.getElementById('browse-header').classList.remove('hidden');
    document.getElementById('rating-row').classList.add('hidden');
    loadBrowseCard();
  } catch (err) { showToast(err.message, 'error'); }
}

function showStudyView() {
  document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const v = document.getElementById('view-study');
  v.classList.remove('hidden'); v.classList.add('active');
  initCanvas();
}

function loadBrowseCard() {
  const cards = state.browseCards;
  const idx = state.browseIdx;
  const card = cards[idx];

  const counter = document.getElementById('browse-counter');
  counter.textContent = `${idx + 1} / ${cards.length}`;

  document.getElementById('btn-browse-prev').disabled = idx === 0;
  document.getElementById('btn-browse-next').textContent = idx === cards.length - 1 ? 'Done ✓' : 'Next →';

  // Reset card faces
  document.getElementById('card-front').classList.remove('hidden');
  document.getElementById('card-back').classList.add('hidden');
  state._cardRevealed = false;

  // Populate
  document.getElementById('card-meaning-front').textContent = card.meaning;
  const exF = document.getElementById('card-example-front');
  exF.textContent = card.exampleSentence || '';
  exF.style.display = card.exampleSentence ? '' : 'none';

  document.getElementById('card-kanji').textContent = card.kanji;
  document.getElementById('card-reading-revealed').textContent = card.reading;
  const ex = document.getElementById('card-example');
  ex.textContent = card.exampleSentence || '';
  ex.style.display = card.exampleSentence ? '' : 'none';

  clearCanvas();
}

function browseNext() {
  if (state.browseIdx >= state.browseCards.length - 1) {
    exitStudy();
    showToast('🎉 You’ve reviewed all cards in this deck!', 'success');
  } else {
    state.browseIdx++;
    loadBrowseCard();
  }
}

function browsePrev() {
  if (state.browseIdx > 0) { state.browseIdx--; loadBrowseCard(); }
}

function loadStudyCard() {
  const card = state.studyQueue[state.studyIdx];
  const total = state.studyQueue.length;

  document.getElementById('study-counter').textContent = `${state.studyIdx} / ${total}`;
  document.getElementById('study-progress-bar').style.width = `${(state.studyIdx / total) * 100}%`;

  // Reset to front (meaning side)
  const front = document.getElementById('card-front');
  const back = document.getElementById('card-back');
  front.classList.remove('hidden');
  back.classList.add('hidden');
  document.getElementById('rating-row').classList.add('hidden');
  state._cardRevealed = false;

  // Front: Meaning (recall — see English, recall kanji)
  document.getElementById('card-meaning-front').textContent = card.meaning;
  const exFront = document.getElementById('card-example-front');
  if (card.exampleSentence) {
    exFront.textContent = card.exampleSentence;
    exFront.style.display = '';
  } else {
    exFront.textContent = '';
    exFront.style.display = 'none';
  }

  // Back: Kanji + Reading + Example
  document.getElementById('card-kanji').textContent = card.kanji;
  document.getElementById('card-reading-revealed').textContent = card.reading;
  const ex = document.getElementById('card-example');
  ex.textContent = card.exampleSentence || '';
  ex.style.display = card.exampleSentence ? '' : 'none';

  clearCanvas();
}

// Toggle card front ↔ back on click.
// Rating row appears on first reveal and stays until rated.
function toggleCard() {
  const front = document.getElementById('card-front');
  const back = document.getElementById('card-back');
  const ratingRow = document.getElementById('rating-row');

  const showingFront = !front.classList.contains('hidden');
  if (showingFront) {
    // Flip to back — reveal kanji + always show ratings
    front.classList.add('hidden');
    back.classList.remove('hidden');
    ratingRow.classList.remove('hidden');        // ← always visible on back
    if (!state._cardRevealed) {
      state._cardRevealed = true;
      // Auto-speak the kanji on first reveal only
      const kanji = document.getElementById('card-kanji').textContent;
      if (kanji) speakWord(kanji);
    }
  } else {
    // Flip back to front — keep rating visible so user can still rate from the front side
    back.classList.add('hidden');
    front.classList.remove('hidden');
    // Do NOT hide ratingRow — user may want to flip back to check before rating
  }
}

// Keep revealCard as alias for keyboard Space shortcut
function revealCard() {
  const front = document.getElementById('card-front');
  if (!front.classList.contains('hidden')) toggleCard();
}

async function submitRating(rating) {
  const card = state.studyQueue[state.studyIdx];
  try {
    await apiFetch('/api/study/review', { method: 'POST', body: JSON.stringify({ flashcardId: card.id, rating }) });
    state.reviewedCount++;
  } catch (err) { showToast(`Review save failed: ${err.message}`, 'error'); }

  state.studyIdx++;
  if (state.studyIdx >= state.studyQueue.length) {
    document.getElementById('complete-sub').textContent =
      `You reviewed ${state.reviewedCount} card${state.reviewedCount !== 1 ? 's' : ''}.`;
    document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
    const done = document.getElementById('view-study-complete');
    done.classList.remove('hidden'); done.classList.add('active');
    await loadDecks();
  } else {
    loadStudyCard();
  }
}

function exitStudy() { state.studyQueue = []; state.studyIdx = 0; showView('dashboard'); renderDashboard(); }

// ═══════════════════════════════════════════════════ HANDWRITING CANVAS ════════

function initCanvas() {
  const canvas = document.getElementById('draw-canvas');
  if (!canvas) return;

  // Size canvas to its container
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const rect = wrap.getBoundingClientRect();
    // Save existing drawing
    const img = canvas.width > 0 ? canvas.toDataURL() : null;
    canvas.width = rect.width || 400;
    canvas.height = rect.height || 300;
    // Restore
    if (img) { const i = new Image(); i.onload = () => getCtx()?.drawImage(i, 0, 0); i.src = img; }
  }

  resizeCanvas();
  new ResizeObserver(resizeCanvas).observe(canvas.parentElement);

  // Mouse events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  // Touch events
  canvas.addEventListener('touchstart', e => { e.preventDefault(); startDrawing(touchToMouse(e, canvas)); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); draw(touchToMouse(e, canvas)); }, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);
}

function touchToMouse(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  return { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top };
}

function getCtx() {
  return document.getElementById('draw-canvas')?.getContext('2d');
}

function startDrawing(e) {
  state.canvas.drawing = true;
  const ctx = getCtx();
  if (!ctx) return;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!state.canvas.drawing) return;
  const ctx = getCtx();
  const size = parseInt(document.getElementById('pen-size')?.value || 4);
  if (!ctx) return;

  ctx.lineWidth = state.canvas.tool === 'eraser' ? size * 4 : size;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (state.canvas.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
  } else {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#e2e2eb';
  }

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function stopDrawing() {
  state.canvas.drawing = false;
  const ctx = getCtx();
  if (ctx) { ctx.globalCompositeOperation = 'source-over'; ctx.beginPath(); }
}

function clearCanvas() {
  const canvas = document.getElementById('draw-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setTool(tool) {
  state.canvas.tool = tool;
  document.getElementById('tool-pen').classList.toggle('active', tool === 'pen');
  document.getElementById('tool-eraser').classList.toggle('active', tool === 'eraser');
}

// ═══════════════════════════════════════════════════════════ STATS ════════════

async function renderStatsPage() {
  await loadDecks();
  const total = state.decks.reduce((s, d) => s + (d.cardCount || 0), 0);
  document.getElementById('stats-total').textContent = total;
  document.getElementById('stats-decks').textContent = state.decks.length;
  document.getElementById('stats-due').textContent = '–';

  const list = document.getElementById('stats-decks-list');
  if (!state.decks.length) { list.innerHTML = '<div class="empty-state">No decks yet.</div>'; return; }

  list.innerHTML = state.decks.map(d => `
    <div class="stats-deck-row">
      <div>
        <div class="stats-deck-name">${esc(d.title)}</div>
        <div class="stats-deck-meta">${d.cardCount} total cards · Created ${new Date(d.createdAt).toLocaleDateString()}</div>
      </div>
      <span class="stats-deck-chip" id="chip-${d.id}">loading…</span>
    </div>`).join('');

  // Async load due counts
  state.decks.forEach(async d => {
    try {
      const due = await apiFetch(`/api/decks/${d.id}/study`);
      const chip = document.getElementById(`chip-${d.id}`);
      if (chip) { chip.textContent = `${due.length} due`; chip.style.color = due.length > 0 ? 'var(--primary)' : 'var(--tertiary)'; }
    } catch { }
  });
}

// ═══════════════════════════════════════════════════════════ MODALS ════════════

function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

function showConfirm(icon, title, body, btnText, callback) {
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

// ═══════════════════════════════════════════════════════════ HELPERS ══════════

function v(id) { return document.getElementById(id)?.value?.trim() || ''; }

function setLoading(btn, loading) {
  btn.disabled = loading;
  const span = btn.querySelector('span');
  if (span) span.textContent = loading ? 'Loading…' : (btn.dataset.label || span.textContent);
}

function showError(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }

let _toastTimer;
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type}`; t.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.add('hidden'), 3800);
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso), now = new Date();
  const diff = Math.round((d - now) / 86400000);
  if (diff <= 0) return '🔴 Due now';
  if (diff === 1) return '🟡 Tomorrow';
  if (diff < 7) return `In ${diff} days`;
  return d.toLocaleDateString();
}

// ═══════════════════════════════════════════════════════════ KEYBOARD ═════════

document.addEventListener('keydown', e => {
  // Esc closes top modal
  if (e.key === 'Escape') {
    const open = document.querySelector('.modal-overlay:not(.hidden)');
    if (open) { closeModal(open.id); return; }
  }

  const inStudy = document.getElementById('view-study')?.classList.contains('active');
  if (!inStudy) return;

  const backHidden = document.getElementById('card-back')?.classList.contains('hidden');
  if ((e.code === 'Space' || e.key === 'Enter') && backHidden) { e.preventDefault(); revealCard(); return; }

  const ratingVisible = !document.getElementById('rating-row')?.classList.contains('hidden');
  if (ratingVisible && ['1', '2', '3', '4'].includes(e.key)) submitRating(parseInt(e.key));
});

// ═══════════════════════════════════════════════════════════════ INIT ═════════

(function init() {
  // Store button default labels
  document.querySelectorAll('button[id] span').forEach(s => s.closest('button').dataset.label = s.textContent);

  // Init TTS voices
  initTTS();

  // Init import drag-drop after DOM ready
  document.addEventListener('DOMContentLoaded', initImportDrop);
  // Also try right now in case DOMContentLoaded already fired
  if (document.readyState !== 'loading') initImportDrop();

  // Auto-login
  if (state.token && state.user) bootApp();
})();
