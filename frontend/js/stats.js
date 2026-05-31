import { state } from './state.js';
import { apiFetch } from './api.js';
import { esc } from './utils.js';
import { loadDecks } from './decks.js';

export async function renderStatsPage() {
  await loadDecks();
  const total = state.decks.reduce((s, d) => s + (d.cardCount || 0), 0);
  const totalDue = state.decks.reduce((s, d) => s + (d.dueCount || 0), 0);
  document.getElementById('stats-total').textContent = total;
  document.getElementById('stats-decks').textContent = state.decks.length;
  document.getElementById('stats-due').textContent = totalDue;

  const list = document.getElementById('stats-decks-list');
  if (!state.decks.length) { list.innerHTML = '<div class="empty-state">No decks yet.</div>'; return; }

  list.innerHTML = state.decks.map(d => {
    const isDue = (d.dueCount || 0) > 0;
    const colorStyle = isDue ? 'color:var(--primary)' : 'color:var(--tertiary)';
    return `
      <div class="stats-deck-row">
        <div>
          <div class="stats-deck-name">${esc(d.title)}</div>
          <div class="stats-deck-meta">${d.cardCount} total cards · Created ${new Date(d.createdAt).toLocaleDateString()}</div>
        </div>
        <span class="stats-deck-chip" id="chip-${d.id}" style="${colorStyle}">${d.dueCount || 0} due</span>
      </div>`;
  }).join('');
}
