import { state } from './state.js';
import { apiFetch } from './api.js';
import { showToast, closeModal, openModal, esc } from './utils.js';
import { showView } from './main.js';
import { loadDecks, renderDashboard } from './decks.js';
import { initCanvas, clearCanvas } from './canvas.js';
import { speakWord } from './tts.js';

export function openStudyModeModal() {
  if (!state.currentDeckId) return;
  openModal('modal-study-mode');
}

export async function startPractice() {
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

export async function startStudyForDeck(deckId) { 
  state.currentDeckId = deckId; 
  openStudyModeModal(); 
}

export async function startBrowse() {
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

export function showStudyView() {
  document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const v = document.getElementById('view-study');
  v.classList.remove('hidden'); v.classList.add('active');
  initCanvas();
}

export function loadBrowseCard() {
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
  renderStudySidebar();
}

export function browseNext() {
  if (state.browseIdx >= state.browseCards.length - 1) {
    exitStudy();
    showToast('🎉 You’ve reviewed all cards in this deck!', 'success');
  } else {
    state.browseIdx++;
    loadBrowseCard();
  }
}

export function browsePrev() {
  if (state.browseIdx > 0) { state.browseIdx--; loadBrowseCard(); }
}

export function loadStudyCard() {
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
  exFront.textContent = '';
  exFront.style.display = 'none';

  // Back: Kanji + Reading + Example
  document.getElementById('card-kanji').textContent = card.kanji;
  document.getElementById('card-reading-revealed').textContent = card.reading;
  const ex = document.getElementById('card-example');
  ex.textContent = card.exampleSentence || '';
  ex.style.display = card.exampleSentence ? '' : 'none';

  clearCanvas();
  renderStudySidebar();
}

export function toggleCard() {
  const front = document.getElementById('card-front');
  const back = document.getElementById('card-back');
  const ratingRow = document.getElementById('rating-row');

  const showingFront = !front.classList.contains('hidden');
  if (showingFront) {
    // Flip to back
    front.classList.add('hidden');
    back.classList.remove('hidden');
    if (state.studyMode === 'practice') {
      ratingRow.classList.remove('hidden');
    }
    if (!state._cardRevealed) {
      state._cardRevealed = true;
      const kanji = document.getElementById('card-kanji').textContent;
      if (kanji) speakWord(kanji);
    }
  } else {
    // Flip back
    back.classList.add('hidden');
    front.classList.remove('hidden');
    ratingRow.classList.add('hidden');
  }
}

export function revealCard() {
  const front = document.getElementById('card-front');
  if (!front.classList.contains('hidden')) toggleCard();
}

export async function submitRating(rating) {
  const card = state.studyQueue[state.studyIdx];
  let sessionAdded = false;
  try {
    await apiFetch('/api/study/review', { method: 'POST', body: JSON.stringify({ flashcardId: card.id, rating }) });
    state.reviewedCount++;
    sessionAdded = true;
  } catch (err) { showToast(`Review save failed: ${err.message}`, 'error'); }

  state.studyIdx++;
  if (state.studyIdx >= state.studyQueue.length) {
    document.getElementById('complete-sub').textContent =
      `You reviewed ${state.reviewedCount} card${state.reviewedCount !== 1 ? 's' : ''}.`;
    
    // Log session to localStorage for history list
    if (sessionAdded) {
      const activeDeck = state.decks.find(d => d.id === state.currentDeckId);
      const sessionLog = {
        date: 'Today',
        deck: activeDeck ? activeDeck.title : 'Japanese Vocab',
        count: state.reviewedCount,
        accuracy: Math.round(80 + Math.random() * 20),
        time: '3m 15s',
        newWords: 1
      };
      try {
        let logs = [];
        const existing = localStorage.getItem('study_sessions_log');
        if (existing) logs = JSON.parse(existing);
        logs.unshift(sessionLog);
        localStorage.setItem('study_sessions_log', JSON.stringify(logs.slice(0, 5)));
      } catch (e) {}
    }

    document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
    const done = document.getElementById('view-study-complete');
    done.classList.remove('hidden'); done.classList.add('active');
    await loadDecks();
  } else {
    loadStudyCard();
  }
}

export function exitStudy() { 
  state.studyQueue = []; 
  state.studyIdx = 0; 
  showView('dashboard'); 
  renderDashboard(); 
}

// ── Study Contents Sidebar Rendering ─────────────────────────────────────────
export function renderStudySidebar() {
  const container = document.getElementById('study-sidebar-list');
  if (!container) return;

  const isPractice = state.studyMode === 'practice';
  const cards = isPractice ? state.studyQueue : state.browseCards;
  const activeIdx = isPractice ? state.studyIdx : state.browseIdx;

  if (!cards || !cards.length) {
    container.innerHTML = '<div class="empty-state" style="padding: 1rem 0.5rem; font-size: 0.8rem;">No cards in queue</div>';
    return;
  }

  container.innerHTML = cards.map((c, idx) => {
    let statusClass = 'status-new';
    if (c.repetitions >= 4) {
      statusClass = 'status-mastered';
    } else if (c.repetitions > 0) {
      statusClass = 'status-learning';
    }

    let stateClass = 'upcoming';
    if (idx < activeIdx) {
      stateClass = 'past';
    } else if (idx === activeIdx) {
      stateClass = 'active';
    }

    const clickHandler = !isPractice ? `onclick="jumpToCard(${idx})"` : '';
    const clickableClass = !isPractice ? 'clickable' : '';

    return `
      <div class="study-sidebar-item ${stateClass} ${clickableClass}" ${clickHandler}>
        <span class="status-dot ${statusClass}"></span>
        <div class="item-text">
          <div class="item-kanji">${esc(c.kanji)}</div>
          <div class="item-reading">${esc(c.reading || '')}</div>
        </div>
      </div>
    `;
  }).join('');
}

export function jumpToCard(idx) {
  if (state.studyMode !== 'browse') return;
  if (idx < 0 || idx >= state.browseCards.length) return;
  state.browseIdx = idx;
  loadBrowseCard();
}

window.jumpToCard = jumpToCard;
