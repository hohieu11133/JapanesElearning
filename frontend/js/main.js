import { state } from './state.js';
import { switchAuthTab, handleLogin, handleRegister, handleLogout } from './auth.js';
import { loadDecks, renderDashboard, renderDecksPage, openCreateDeckModal, handleCreateDeck, openEditDeckModal, handleEditDeck, confirmDeleteDeck, confirmDeleteDeckById, openDeck } from './decks.js';
import { openAddCardModal, handleAddCard, openEditCardModal, handleEditCard, confirmDeleteCard } from './cards.js';
import { openImportModal, handleImportFile, onImportTextChange, handleConfirmImport, initImportDrop } from './import.js';
import { openStudyModeModal, startPractice, startBrowse, startStudyForDeck, browseNext, browsePrev, toggleCard, revealCard, submitRating, exitStudy } from './study.js';
import { setTool, clearCanvas } from './canvas.js';
import { renderStatsPage } from './stats.js';
import { initTTS, speakWord } from './tts.js';
import { closeModal } from './utils.js';

// ═══════════════════════════════════════════════════════════ NAVIGATION ════════

export function showView(name) {
  document.querySelectorAll('.view').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const view = document.getElementById(`view-${name}`);
  if (view) { view.classList.remove('hidden'); view.classList.add('active'); }
  const nav = document.getElementById(`nav-${name}`);
  if (nav) nav.classList.add('active');

  if (name === 'decks') renderDecksPage();
  if (name === 'stats') renderStatsPage();
}

// ═══════════════════════════════════════════════════════════ APP BOOT ═════════

export async function bootApp() {
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

// ═══════════════════════════════════════════════════════════ EXPOSE GLOBALS ════
// Necessary for inline HTML event handlers (e.g., onclick="...")
window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleLogout = handleLogout;
window.showView = showView;
window.openCreateDeckModal = openCreateDeckModal;
window.handleCreateDeck = handleCreateDeck;
window.openEditDeckModal = openEditDeckModal;
window.handleEditDeck = handleEditDeck;
window.confirmDeleteDeck = confirmDeleteDeck;
window.confirmDeleteDeckById = confirmDeleteDeckById;
window.openDeck = openDeck;
window.openAddCardModal = openAddCardModal;
window.handleAddCard = handleAddCard;
window.openEditCardModal = openEditCardModal;
window.handleEditCard = handleEditCard;
window.confirmDeleteCard = confirmDeleteCard;
window.openImportModal = openImportModal;
window.handleImportFile = handleImportFile;
window.onImportTextChange = onImportTextChange;
window.handleConfirmImport = handleConfirmImport;
window.openStudyModeModal = openStudyModeModal;
window.startPractice = startPractice;
window.startBrowse = startBrowse;
window.startStudyForDeck = startStudyForDeck;
window.browseNext = browseNext;
window.browsePrev = browsePrev;
window.toggleCard = toggleCard;
window.revealCard = revealCard;
window.submitRating = submitRating;
window.exitStudy = exitStudy;
window.setTool = setTool;
window.clearCanvas = clearCanvas;
window.speakWord = speakWord;
window.closeModal = closeModal;

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
  if (document.readyState !== 'loading') initImportDrop();

  // Auto-login
  if (state.token && state.user) bootApp();
})();
