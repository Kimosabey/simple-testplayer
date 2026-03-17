const QUESTIONS = [
  {
    id: 'q1',
    title: 'Landmark for primary content',
    category: 'Semantics',
    correct: 'main',
    correctLabel: '<main>',
    valueLabels: {
      div: '<div>',
      main: '<main>',
      aside: '<aside>',
      section: '<section>',
    },
    explanation: 'Use <main> once per page for the primary content so assistive tech can jump straight to it.',
  },
  {
    id: 'q2',
    title: 'Navigation landmark',
    category: 'Semantics',
    correct: 'nav',
    correctLabel: '<nav>',
    valueLabels: {
      div: '<div>',
      nav: '<nav>',
      section: '<section>',
      aside: '<aside>',
    },
    explanation: '<nav> represents a major block of navigation links and creates a useful landmark.',
  },
  {
    id: 'q3',
    title: 'Labeling inputs',
    category: 'Forms',
    correct: 'label',
    correctLabel: '<label for="…">',
    valueLabels: {
      placeholder: 'placeholder',
      label: '<label for="…">',
      title: 'title',
      br: '<br>',
    },
    explanation: 'A <label> provides an accessible name and increases the clickable target area.',
  },
  {
    id: 'q4',
    title: 'Decorative images',
    category: 'Media',
    correct: 'empty',
    correctLabel: 'alt=""',
    valueLabels: {
      omit: 'Omit alt',
      empty: 'alt=""',
      space: 'alt=" "',
      decor: 'alt="decorative"',
    },
    explanation: 'An empty alt text marks the image as decorative so screen readers can skip it.',
  },
  {
    id: 'q5',
    title: 'Heading hierarchy',
    category: 'Semantics',
    correct: 'h2',
    correctLabel: '<h2>',
    valueLabels: {
      h3: '<h3>',
      h2: '<h2>',
      h6: '<h6>',
      p: '<p>',
    },
    explanation: 'Keep a logical outline: H1 → H2 → H3, etc. Avoid skipping levels without a reason.',
  },
  {
    id: 'q6',
    title: 'Form submission',
    category: 'Forms',
    correct: 'submit',
    correctLabel: 'type="submit"',
    valueLabels: {
      submit: 'type="submit"',
      button: 'type="button"',
      reset: 'type="reset"',
      link: 'type="link"',
    },
    explanation: 'Explicitly setting type="submit" avoids surprises when buttons are reused or moved.',
  },
  {
    id: 'q7',
    title: 'Input types',
    category: 'Forms',
    correct: 'email',
    correctLabel: 'type="email"',
    valueLabels: {
      text: 'type="text"',
      email: 'type="email"',
      url: 'type="url"',
      number: 'type="number"',
    },
    explanation: 'type="email" provides appropriate keyboards on mobile and enables built-in constraints.',
  },
  {
    id: 'q8',
    title: 'Page footer',
    category: 'Semantics',
    correct: 'footer',
    correctLabel: '<footer>',
    valueLabels: {
      footer: '<footer>',
      bottom: '<bottom>',
      aside: '<aside>',
      section: '<section>',
    },
    explanation: '<footer> identifies footer content for a page or section, improving document structure.',
  },
  {
    id: 'q9',
    title: 'Captions',
    category: 'Media',
    correct: 'figure',
    correctLabel: '<figure> + <figcaption>',
    valueLabels: {
      figure: '<figure> + <figcaption>',
      div: '<div> + <p>',
      imgtitle: 'img title',
      marquee: '<marquee>',
    },
    explanation: '<figure> groups media with its caption as a semantic unit.',
  },
  {
    id: 'q10',
    title: 'Announcing updates',
    category: 'Accessibility',
    correct: 'aria-live',
    correctLabel: 'aria-live',
    valueLabels: {
      'aria-live': 'aria-live',
      'aria-hidden': 'aria-hidden',
      tabindex: 'tabindex',
      draggable: 'draggable',
    },
    explanation: 'aria-live defines a live region to announce content changes without moving focus.',
  },
];

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function formatDuration(ms) {
  if (!ms || ms < 0) return '—';
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatPace(msPerQuestion) {
  if (!msPerQuestion || msPerQuestion <= 0) return '—';
  const seconds = Math.round(msPerQuestion / 1000);
  return `${seconds}s / q`;
}

function safeText(v) {
  if (v == null || v === '') return '—';
  return String(v);
}

function getStartTimeMs() {
  const raw = sessionStorage.getItem('testStartMs');
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

function setStartTimeNow() {
  sessionStorage.setItem('testStartMs', String(Date.now()));
}

function clearStartTime() {
  sessionStorage.removeItem('testStartMs');
}

function initTestTimer() {
  const pill = document.getElementById('elapsedPill');
  const form = document.getElementById('testForm');
  const elapsedField = document.getElementById('elapsedField');

  if (!form || !elapsedField) return;

  if (!getStartTimeMs()) setStartTimeNow();

  const tick = () => {
    const start = getStartTimeMs();
    if (!start) return;
    const ms = Date.now() - start;
    if (pill) pill.textContent = `Timer: ${formatDuration(ms)}`;
  };

  tick();
  window.setInterval(tick, 1000);

  form.addEventListener('submit', () => {
    const start = getStartTimeMs();
    if (start) elapsedField.value = String(Date.now() - start);
  });
}

function computeResults(params) {
  const answers = QUESTIONS.map((q) => {
    const selected = params.get(q.id);
    const isAnswered = selected != null && selected !== '';
    const isCorrect = isAnswered && selected === q.correct;

    return {
      ...q,
      selected,
      isAnswered,
      isCorrect,
    };
  });

  const total = QUESTIONS.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const answered = answers.filter((a) => a.isAnswered).length;
  const skipped = total - answered;

  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  const byCategory = new Map();
  for (const a of answers) {
    const current = byCategory.get(a.category) || { total: 0, correct: 0 };
    current.total += 1;
    if (a.isCorrect) current.correct += 1;
    byCategory.set(a.category, current);
  }

  const categories = Array.from(byCategory.entries())
    .map(([name, v]) => ({ name, ...v, pct: v.total ? Math.round((v.correct / v.total) * 100) : 0 }))
    .sort((a, b) => b.pct - a.pct);

  return { total, correct, answered, skipped, accuracy, categories, answers };
}

function summaryForAccuracy(accuracy) {
  if (accuracy >= 90) return 'Excellent. This set is beneath you — increase difficulty.';
  if (accuracy >= 80) return 'Strong run. Smooth out the last few gaps and you’re there.';
  if (accuracy >= 65) return 'Solid baseline. Your misses are clustered — review the weak categories.';
  return 'Early-stage. Slow down, focus on semantics and form labeling, then retake.';
}

function renderCategoryBars(categories) {
  const container = document.getElementById('categoryBars');
  if (!container) return;

  container.innerHTML = '';
  for (const c of categories) {
    const row = document.createElement('div');
    row.className = 'bar';

    const label = document.createElement('label');
    label.textContent = `${c.name} (${c.correct}/${c.total})`;

    const track = document.createElement('div');
    track.className = 'track';

    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.setProperty('--w', `${clamp(c.pct, 0, 100)}%`);

    track.appendChild(fill);
    row.appendChild(label);
    row.appendChild(track);
    container.appendChild(row);
  }
}

function renderReview(answers) {
  const container = document.getElementById('reviewList');
  if (!container) return;

  container.innerHTML = '';

  for (const [idx, a] of answers.entries()) {
    const details = document.createElement('details');
    details.className = 'panel';

    const status = a.isAnswered ? (a.isCorrect ? 'Correct' : 'Miss') : 'Skipped';
    const statusPillStyle = a.isCorrect
      ? 'border-color: rgba(224, 123, 57, 0.55); background: rgba(224, 123, 57, 0.10);'
      : 'border-color: rgba(26, 26, 26, 0.12); background: rgba(255, 255, 255, 0.32);';

    const yourAnswer = a.isAnswered
      ? safeText(a.valueLabels?.[a.selected] ?? a.selected)
      : '—';

    details.innerHTML = `
      <summary class="details-summary">
        <div class="meta">
          <span class="pill">Q${idx + 1}</span>
          <span class="pill">${a.category}</span>
          <span class="pill" style="${statusPillStyle}">${status}</span>
        </div>
        <div class="rule"></div>
        <div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <div class="small"><strong>${a.title}</strong></div>
          <div class="small">Correct: <strong>${a.correctLabel}</strong></div>
        </div>
      </summary>
      <div style="height: 10px"></div>
      <div class="small">Your answer: <strong>${yourAnswer}</strong></div>
      <div class="rule"></div>
      <div class="small">${a.explanation}</div>
    `;

    container.appendChild(details);
  }
}

function renderResults() {
  const params = new URLSearchParams(window.location.search);
  const computed = computeResults(params);

  let elapsedMs = 0;
  const rawElapsed = params.get('elapsed');
  if (rawElapsed) elapsedMs = Number.parseInt(rawElapsed, 10) || 0;

  if (!elapsedMs) {
    const start = getStartTimeMs();
    if (start) elapsedMs = Date.now() - start;
  }

  clearStartTime();

  const accuracyText = `${computed.accuracy}%`;

  const scoreLine = document.getElementById('scoreLine');
  const summaryLine = document.getElementById('summaryLine');
  const statAccuracy = document.getElementById('statAccuracy');
  const statCorrect = document.getElementById('statCorrect');
  const statCorrectNote = document.getElementById('statCorrectNote');
  const statTime = document.getElementById('statTime');
  const statPace = document.getElementById('statPace');
  const donut = document.getElementById('donut');
  const donutPct = document.getElementById('donutPct');
  const analysisPill = document.getElementById('analysisPill');

  if (scoreLine) scoreLine.textContent = `${computed.correct} / ${computed.total}`;
  if (summaryLine) summaryLine.textContent = summaryForAccuracy(computed.accuracy);
  if (statAccuracy) statAccuracy.textContent = accuracyText;
  if (statCorrect) statCorrect.textContent = String(computed.correct);
  if (statCorrectNote)
    statCorrectNote.textContent = `Out of ${computed.total} questions. ${computed.skipped} skipped.`;

  if (statTime) statTime.textContent = formatDuration(elapsedMs);

  const paceMs = computed.answered ? Math.round(elapsedMs / computed.answered) : 0;
  if (statPace) statPace.textContent = `Pace: ${formatPace(paceMs)}`;

  if (donut) donut.style.setProperty('--p', String(clamp(computed.accuracy, 0, 100)));
  if (donutPct) donutPct.textContent = accuracyText;

  if (analysisPill) {
    analysisPill.textContent = computed.answered ? `From ${computed.answered} answers` : 'Sample data (no answers provided)';
  }

  renderCategoryBars(computed.categories);
  renderReview(computed.answers);
}

document.addEventListener('DOMContentLoaded', () => {
  initTestTimer();

  if (document.getElementById('resultsRoot')) {
    renderResults();
  }
});
