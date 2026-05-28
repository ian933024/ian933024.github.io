const YEARS = ['110', '111', '112', '113', '114'];

const state = {
  questions: [],
  frequency: [],
  meta: null,
  selectedSubject: null,
  searchText: '',
  expandedFocus: null,
};

const $ = id => document.getElementById(id);

function escapeHtml(v) {
  return String(v ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function filtered() {
  return state.frequency.filter(item => {
    const bySubject = !state.selectedSubject ||
      (item.smallSubjects ?? []).includes(state.selectedSubject);
    const byText = !state.searchText ||
      item.focus.includes(state.searchText);
    return bySubject && byText;
  });
}

function renderPills() {
  const wrap = $('subjectPills');
  const cur = state.selectedSubject;
  wrap.innerHTML = [
    `<button class="pill${!cur ? ' active' : ''}" data-val="">全部</button>`,
    ...state.meta.smallSubjects.map(s =>
      `<button class="pill${cur === s ? ' active' : ''}" data-val="${escapeHtml(s)}">${escapeHtml(s)}</button>`
    )
  ].join('');

  wrap.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedSubject = btn.dataset.val || null;
      state.expandedFocus = null;
      renderAll();
    });
  });
}

function yearDots(years = []) {
  return YEARS.map(y => {
    const on = years.includes(y);
    return `<span class="yd${on ? ' on' : ''}" title="${y}年">${y.slice(1)}</span>`;
  }).join('');
}

function renderList() {
  const items = filtered();

  // If the expanded item is no longer visible after filtering, collapse it
  if (state.expandedFocus && !items.find(i => i.focus === state.expandedFocus)) {
    state.expandedFocus = null;
  }

  $('resultCount').textContent = `顯示 ${items.length} / ${state.frequency.length} 個概念`;
  $('clearBtn').hidden = !state.selectedSubject && !state.searchText;

  const list = $('focusList');

  if (items.length === 0) {
    list.innerHTML = '<p class="empty-msg">無符合條件的概念</p>';
    return;
  }

  list.innerHTML = '';
  for (const item of items) {
    const isOpen = state.expandedFocus === item.focus;
    const el = document.createElement('div');
    el.className = `fi${isOpen ? ' open' : ''}`;
    el.setAttribute('role', 'listitem');

    const tags = (item.smallSubjects ?? [])
      .map(s => `<span class="stag">${escapeHtml(s)}</span>`).join('');

    el.innerHTML = `
      <button class="fi-head" type="button" aria-expanded="${isOpen}">
        <span class="fi-name">${escapeHtml(item.focus)}</span>
        <span class="fi-right">
          <span class="fi-count"><b>${item.count}</b>次</span>
          <span class="yd-row">${yearDots(item.years)}</span>
          <span class="stag-row">${tags}</span>
          <span class="fi-arrow">▾</span>
        </span>
      </button>
      <div class="fi-body"></div>
    `;

    el.querySelector('.fi-head').addEventListener('click', () => {
      const wasOpen = state.expandedFocus === item.focus;
      state.expandedFocus = wasOpen ? null : item.focus;
      toggleItem(el, item.focus, !wasOpen);
    });

    list.appendChild(el);

    if (isOpen) fillBody(el.querySelector('.fi-body'), item.focus);
  }
}

function toggleItem(targetEl, focus, open) {
  // Collapse any other open item
  document.querySelectorAll('.fi.open').forEach(el => {
    if (el !== targetEl) {
      el.classList.remove('open');
      el.querySelector('.fi-head').setAttribute('aria-expanded', 'false');
      el.querySelector('.fi-body').innerHTML = '';
    }
  });

  targetEl.classList.toggle('open', open);
  targetEl.querySelector('.fi-head').setAttribute('aria-expanded', String(open));

  const body = targetEl.querySelector('.fi-body');
  if (open) {
    fillBody(body, focus);
    // Smooth scroll so the header stays visible
    setTimeout(() => {
      const rect = targetEl.getBoundingClientRect();
      if (rect.top < 0) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  } else {
    body.innerHTML = '';
  }
}

function fillBody(bodyEl, focus) {
  const questions = state.questions
    .filter(q => q.focus === focus)
    .sort((a, b) => Number(a.year) - Number(b.year) || Number(a.number) - Number(b.number));

  if (!questions.length) {
    bodyEl.innerHTML = '<p class="empty-msg">無題目資料</p>';
    return;
  }

  bodyEl.innerHTML = questions.map(q => {
    const ctx = q.context
      ? `<div class="q-ctx">${escapeHtml(q.context)}</div>`
      : '';
    return `
      <div class="q-card">
        <div class="q-meta">
          <span class="q-year">${escapeHtml(q.year)} 年</span>
          <span class="q-badge">${escapeHtml(q.smallSubject)}</span>
          <span class="q-badge">${escapeHtml(q.type)}</span>
          <span class="q-badge">第 ${escapeHtml(String(q.number))} 題</span>
        </div>
        ${ctx}
        <div class="q-text">${escapeHtml(q.question)}</div>
      </div>
    `;
  }).join('');
}

function renderAll() {
  renderPills();
  renderList();
}

function bindEvents() {
  $('focusSearch').addEventListener('input', e => {
    state.searchText = e.target.value;
    renderList();
  });

  $('clearBtn').addEventListener('click', () => {
    state.selectedSubject = null;
    state.searchText = '';
    $('focusSearch').value = '';
    state.expandedFocus = null;
    renderAll();
  });
}

async function init() {
  const [questions, freq, meta] = await Promise.all([
    fetch('./data/questions.json').then(r => r.json()),
    fetch('./data/frequency.json').then(r => r.json()),
    fetch('./data/meta.json').then(r => r.json()),
  ]);
  state.questions = questions;
  state.frequency = freq.focusFrequency;
  state.meta = meta;
}

init()
  .then(() => {
    bindEvents();
    renderAll();
    $('appFooter').textContent =
      `共 ${state.meta.totalQuestions} 題 · ${state.meta.totalFocuses} 個概念 · 涵蓋 ${state.meta.years.join('、')} 年`;
  })
  .catch(err => {
    document.body.innerHTML = `
      <div style="padding:2rem;max-width:640px;margin:auto">
        <h2 style="margin-bottom:1rem">資料載入失敗</h2>
        <p>請透過靜態伺服器（如 GitHub Pages 或 VS Code Live Server）開啟，不能直接用 file:// 開啟。</p>
        <pre style="margin-top:1rem;padding:1rem;background:#f1f5f9;border-radius:8px;font-size:0.8rem">${escapeHtml(err.message)}</pre>
      </div>
    `;
  });
