// ── State ────────────────────────────────────────────────────────────────────
export const state = {
  token: localStorage.getItem('jpe_token') || null,
  user: JSON.parse(localStorage.getItem('jpe_user') || 'null'),
  decks: [],
  currentDeckId: null,
  currentCards: [],
  studyQueue: [],
  studyIdx: 0,
  reviewedCount: 0,
  studyMode: 'practice',   // 'practice' | 'browse'
  browseCards: [],         // all cards for browse mode
  browseIdx: 0,
  importParsed: [],
  canvas: { drawing: false, tool: 'pen', size: 4 },
  confirmCallback: null,
  _cardRevealed: false,
};
