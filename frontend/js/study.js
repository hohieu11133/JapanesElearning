import { state } from './state.js';
import { apiFetch } from './api.js';
import { showToast, closeModal, openModal } from './utils.js';
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

export function toggleCard() {
  const front = document.getElementById('card-front');
  const back = document.getElementById('card-back');
  const ratingRow = document.getElementById('rating-row');

  const showingFront = !front.classList.contains('hidden');
  if (showingFront) {
    // Flip to back
    front.classList.add('hidden');
    back.classList.remove('hidden');
    ratingRow.classList.remove('hidden');
    if (!state._cardRevealed) {
      state._cardRevealed = true;
      const kanji = document.getElementById('card-kanji').textContent;
      if (kanji) speakWord(kanji);
    }
  } else {
    // Flip back
    back.classList.add('hidden');
    front.classList.remove('hidden');
  }
}

export function revealCard() {
  const front = document.getElementById('card-front');
  if (!front.classList.contains('hidden')) toggleCard();
}

export async function submitRating(rating) {
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

export function exitStudy() { 
  state.studyQueue = []; 
  state.studyIdx = 0; 
  showView('dashboard'); 
  renderDashboard(); 
}
