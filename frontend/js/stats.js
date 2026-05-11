import { state } from './state.js';
import { apiFetch } from './api.js';
import { esc } from './utils.js';
import { loadDecks } from './decks.js';

export async function renderStatsPage() {
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
