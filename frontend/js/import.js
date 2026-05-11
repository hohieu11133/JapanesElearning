import { state } from './state.js';
import { apiFetch } from './api.js';
import { esc, showToast, showError, openModal, closeModal } from './utils.js';
import { loadAllCards } from './cards.js';

export function openImportModal() {
  document.getElementById('import-textarea').value = '';
  document.getElementById('import-file').value = '';
  document.getElementById('import-preview-wrap').classList.add('hidden');
  document.getElementById('import-error').classList.add('hidden');
  document.getElementById('btn-confirm-import').disabled = true;
  document.getElementById('import-btn-count').textContent = '0';
  state.importParsed = [];
  openModal('modal-import');
}

export function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('import-textarea').value = ev.target.result;
    onImportTextChange();
  };
  reader.readAsText(file, 'utf-8');
}

export function onImportTextChange() {
  const text = document.getElementById('import-textarea').value;
  const { cards, errors } = parseImportText(text);
  state.importParsed = cards;
  previewImportCards(cards, errors);
}

export function parseImportText(text) {
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

export function previewImportCards(cards, errors = []) {
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

export async function handleConfirmImport() {
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
export function initImportDrop() {
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
