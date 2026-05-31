import { state } from './state.js';
import { apiFetch } from './api.js';
import { esc } from './utils.js';
import { loadDecks } from './decks.js';

// ── Heatmap Drawing ──────────────────────────────────────────────────────────
export function drawHeatmap(elementId, monthsLimit = 12, realLogs = []) {
  const grid = document.getElementById(elementId);
  if (!grid) return;

  grid.innerHTML = '';
  const now = new Date();
  
  // Calculate start date (monthsLimit ago, aligned to Sunday)
  const startDate = new Date();
  startDate.setMonth(now.getMonth() - monthsLimit);
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const msBetween = now.getTime() - startDate.getTime();
  const totalDays = Math.ceil(msBetween / (24 * 60 * 60 * 1000)) + 1;

  // Index realLogs by date: "yyyy-MM-dd" -> count
  const logsMap = {};
  if (realLogs && Array.isArray(realLogs)) {
    realLogs.forEach(log => {
      if (log.date) {
        logsMap[log.date] = log.count;
      }
    });
  }

  let html = '';
  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    // Format date as yyyy-MM-dd
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const count = logsMap[dateStr] || 0;
    
    let level = 0;
    if (count > 0) {
      if (count <= 3) level = 1;
      else if (count <= 8) level = 2;
      else if (count <= 15) level = 3;
      else level = 4;
    }

    const title = `${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${count} card${count !== 1 ? 's' : ''} reviewed`;
    html += `<div class="heatmap-cell level-${level}" title="${title}"></div>`;
  }
  
  grid.innerHTML = html;
  grid.style.gridTemplateRows = 'repeat(7, 10px)';
  grid.style.gridAutoFlow = 'column';
}

// ── Donut Chart Drawing ──────────────────────────────────────────────────────
export function updateDonutChart(prefix, masteredCount, learningCount, totalCount) {
  const masteredSeg = document.getElementById(`${prefix}-segment-mastered`) || document.getElementById(`${prefix}-donut-mastered`);
  const learningSeg = document.getElementById(`${prefix}-segment-learning`) || document.getElementById(`${prefix}-donut-learning`);
  const totalEl = document.getElementById(`${prefix}-total-count`) || document.getElementById(`${prefix}-donut-total`);
  
  const pctMasteredEl = document.getElementById(`${prefix}-pct-mastered`);
  const pctLearningEl = document.getElementById(`${prefix}-pct-learning`);
  const pctNewEl = document.getElementById(`${prefix}-pct-new`);

  if (totalEl) totalEl.textContent = totalCount;

  if (totalCount === 0) {
    if (masteredSeg) masteredSeg.style.strokeDashoffset = 251.2;
    if (learningSeg) learningSeg.style.strokeDashoffset = 251.2;
    if (pctMasteredEl) pctMasteredEl.textContent = '0%';
    if (pctLearningEl) pctLearningEl.textContent = '0%';
    if (pctNewEl) pctNewEl.textContent = '0%';
    return;
  }

  const pctMastered = Math.round((masteredCount / totalCount) * 100);
  const pctLearning = Math.round((learningCount / totalCount) * 100);
  const pctNew = 100 - pctMastered - pctLearning;

  if (pctMasteredEl) pctMasteredEl.textContent = `${pctMastered}%`;
  if (pctLearningEl) pctLearningEl.textContent = `${pctLearning}%`;
  if (pctNewEl) pctNewEl.textContent = `${pctNew}%`;

  const circ = 251.2;
  const masteredVal = (masteredCount / totalCount) * circ;
  const learningVal = (learningCount / totalCount) * circ;

  if (masteredSeg) {
    masteredSeg.style.strokeDasharray = `${circ}`;
    masteredSeg.style.strokeDashoffset = `${circ - masteredVal}`;
  }

  if (learningSeg) {
    learningSeg.style.strokeDasharray = `${circ}`;
    learningSeg.style.strokeDashoffset = `${circ - learningVal}`;
    const learningRotation = -90 + (masteredCount / totalCount) * 360;
    learningSeg.style.transform = `rotate(${learningRotation}deg)`;
  }
}

// ── Weekly Outlook Chart ─────────────────────────────────────────────────────
export function renderWeeklyOutlook(elementId, allCards) {
  const container = document.getElementById(elementId);
  if (!container) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayCounts = Array(7).fill(0);
  const dayNames = [];

  for (let i = 0; i < 7; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    
    const name = targetDate.toLocaleDateString('en-US', { weekday: 'short' });
    dayNames.push({
      name,
      isToday: i === 0,
      dateStr: targetDate.toDateString()
    });

    const targetEnd = new Date(targetDate);
    targetEnd.setDate(targetDate.getDate() + 1);

    const dueCount = allCards.filter(c => {
      const reviewDate = new Date(c.nextReviewDate);
      return reviewDate >= targetDate && reviewDate < targetEnd;
    }).length;

    dayCounts[i] = dueCount;
  }

  const maxCount = Math.max(...dayCounts, 5);

  container.innerHTML = dayNames.map((day, idx) => {
    const count = dayCounts[idx];
    const pct = Math.round((count / maxCount) * 100);
    const todayClass = day.isToday ? 'today' : '';
    const tooltip = day.isToday ? '<div class="bar-today-tooltip">TODAY</div>' : '';
    
    return `
      <div class="outlook-bar-col ${todayClass}" title="${count} cards due">
        <div class="outlook-bar-val" style="height: ${pct}%">
          ${tooltip}
        </div>
        <span class="outlook-bar-label">${day.name}</span>
      </div>
    `;
  }).join('');
}

// ── Stats Page Main Render ───────────────────────────────────────────────────
export async function renderStatsPage() {
  await loadDecks();
  
  // Load basic stats
  let statsObj = { dueToday: 0, dayStreak: 0, totalCards: 0, activeDecks: 0 };
  try {
    statsObj = await apiFetch('/api/study/stats') || statsObj;
  } catch (err) {
    console.error('renderStatsPage loadStats:', err);
  }

  // Populate basic stats cards
  document.getElementById('stats-total').textContent = statsObj.totalCards;
  document.getElementById('stats-decks').textContent = statsObj.activeDecks;
  document.getElementById('stats-due').textContent = statsObj.dueToday;
  document.getElementById('stats-streak').textContent = `🔥 ${statsObj.dayStreak}`;

  // Fetch detailed stats (heatmap, retention, session logs) from database
  let detailedObj = { retentionRate: 100, heatmap: [], recentSessions: [] };
  try {
    detailedObj = await apiFetch('/api/study/detailed-stats') || detailedObj;
  } catch (err) {
    console.error('renderStatsPage loadDetailedStats:', err);
  }

  // Fetch all cards for distribution & outlook
  let allCards = [];
  try {
    const cardsLists = await Promise.all(state.decks.map(async (d) => {
      try { return await apiFetch(`/api/decks/${d.id}/cards`) || []; }
      catch { return []; }
    }));
    allCards = cardsLists.flat();
  } catch (err) {
    console.error('renderStatsPage loadAllCards:', err);
  }

  const totalCount = allCards.length;
  const masteredCount = allCards.filter(c => c.repetitions >= 4).length;
  const learningCount = allCards.filter(c => c.repetitions > 0 && c.repetitions < 4).length;

  // Render Heatmap (12 months using real logs)
  drawHeatmap('stats-heatmap-grid', 12, detailedObj.heatmap);

  // Render Vocab Donut
  updateDonutChart('stats', masteredCount, learningCount, totalCount);

  // Render Weekly Outlook
  renderWeeklyOutlook('stats-outlook-bar-wrap', allCards);

  // Render circular retention gauge dynamically
  const retentionValEl = document.getElementById('stats-retention-val');
  const retentionCircleEl = document.getElementById('stats-retention-circle');
  if (retentionValEl) {
    retentionValEl.textContent = `${detailedObj.retentionRate}%`;
  }
  if (retentionCircleEl) {
    const circ = 251.2;
    const offset = circ - (detailedObj.retentionRate / 100) * circ;
    retentionCircleEl.style.strokeDashoffset = offset;
  }

  // Render Recent Sessions
  const historyTbody = document.getElementById('stats-history-tbody');
  if (historyTbody) {
    const sessions = detailedObj.recentSessions || [];
    if (sessions.length === 0) {
      historyTbody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state" style="padding: 2rem 1rem;">
            No review history found. Complete a study session to log your progress!
          </td>
        </tr>`;
    } else {
      historyTbody.innerHTML = sessions.map(s => `
        <tr>
          <td class="px-6 py-4">${s.date}</td>
          <td><span class="stats-deck-chip">${esc(s.deck)}</span></td>
          <td>${s.count}</td>
          <td class="${s.accuracy >= 85 ? 'text-tertiary' : 'text-secondary'}">${s.accuracy}%</td>
          <td>${s.timeSpent}</td>
          <td class="text-right font-bold text-primary">${s.newWords}</td>
        </tr>
      `).join('');
    }
  }

  // Render Decks overview list
  const list = document.getElementById('stats-decks-list');
  if (!state.decks.length) {
    list.innerHTML = '<div class="empty-state">No decks yet.</div>';
    return;
  }

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
