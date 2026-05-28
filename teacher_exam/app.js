const state = {
  questions: [],
  frequency: [],
  meta: null,
  filters: {
    year: "",
    subject: "",
    smallSubject: "",
    type: "",
    focus: "",
    keyword: "",
  },
};

const $ = (id) => document.getElementById(id);

const controls = {
  year: $("yearFilter"),
  subject: $("subjectFilter"),
  smallSubject: $("smallSubjectFilter"),
  type: $("typeFilter"),
  focus: $("focusFilter"),
  keyword: $("keywordSearch"),
};

const collator = new Intl.Collator("zh-Hant");

function uniqueSorted(items) {
  return [...new Set(items.filter(Boolean))].sort((a, b) => collator.compare(a, b));
}

function fillSelect(select, values, label) {
  const current = select.value;
  select.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = `全部${label}`;
  select.appendChild(all);
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
  select.value = values.includes(current) ? current : "";
}

function questionMatches(question) {
  const { year, subject, smallSubject, type, focus, keyword } = state.filters;
  if (year && question.year !== year) return false;
  if (subject && question.subject !== subject) return false;
  if (smallSubject && question.smallSubject !== smallSubject) return false;
  if (type && question.type !== type) return false;
  if (focus && question.focus !== focus) return false;
  if (keyword) {
    const haystack = [
      question.year,
      question.subject,
      question.type,
      question.smallSubject,
      question.focus,
      question.context,
      question.question,
    ]
      .join("\n")
      .toLowerCase();
    if (!haystack.includes(keyword.toLowerCase())) return false;
  }
  return true;
}

function filteredQuestions() {
  return state.questions.filter(questionMatches);
}

function frequencyFromQuestions(questions) {
  const map = new Map();
  for (const question of questions) {
    if (!map.has(question.focus)) {
      map.set(question.focus, {
        focus: question.focus,
        count: 0,
        subjects: new Set(),
        smallSubjects: new Set(),
      });
    }
    const item = map.get(question.focus);
    item.count += 1;
    item.subjects.add(question.subject);
    item.smallSubjects.add(question.smallSubject);
  }
  return [...map.values()]
    .sort((a, b) => b.count - a.count || collator.compare(a.focus, b.focus))
    .map((item, index) => ({
      rank: index + 1,
      focus: item.focus,
      count: item.count,
      subjects: [...item.subjects].sort((a, b) => collator.compare(a, b)),
      smallSubjects: [...item.smallSubjects].sort((a, b) => collator.compare(a, b)),
    }));
}

function updateDependentOptions() {
  const base = state.questions.filter((question) => {
    if (state.filters.year && question.year !== state.filters.year) return false;
    if (state.filters.subject && question.subject !== state.filters.subject) return false;
    if (state.filters.type && question.type !== state.filters.type) return false;
    return true;
  });

  fillSelect(controls.year, uniqueSorted(state.questions.map((q) => q.year)), "年份");
  fillSelect(controls.subject, uniqueSorted(state.questions.map((q) => q.subject)), "科目");
  fillSelect(controls.type, uniqueSorted(state.questions.map((q) => q.type)), "題型");
  fillSelect(controls.smallSubject, uniqueSorted(base.map((q) => q.smallSubject)), "小科目");
  fillSelect(controls.focus, uniqueSorted(base.map((q) => q.focus)), "重點");
}

function renderMetrics(questions, frequency) {
  $("totalQuestions").textContent = state.questions.length.toLocaleString();
  $("visibleQuestions").textContent = questions.length.toLocaleString();
  $("totalFocuses").textContent = state.frequency.length.toLocaleString();
  $("highFrequencyCount").textContent = state.frequency.filter((item) => item.count >= 10).length.toLocaleString();
  $("resultCount").textContent = `${questions.length.toLocaleString()} 題`;
  $("focusListCount").textContent = `${frequency.length.toLocaleString()} 項`;
}

function renderFocusList(frequency) {
  const container = $("focusList");
  container.innerHTML = "";
  const topItems = frequency.slice(0, 60);
  if (topItems.length === 0) {
    container.innerHTML = '<div class="empty">沒有符合條件的重點</div>';
    return;
  }
  for (const item of topItems) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `focus-item${state.filters.focus === item.focus ? " active" : ""}`;
    button.innerHTML = `
      <span class="focus-name">${escapeHtml(item.focus)}</span>
      <span class="focus-count">${item.count}</span>
    `;
    button.addEventListener("click", () => {
      state.filters.focus = state.filters.focus === item.focus ? "" : item.focus;
      controls.focus.value = state.filters.focus;
      render();
    });
    container.appendChild(button);
  }
}

function renderFrequencyRows(frequency) {
  const tbody = $("frequencyRows");
  tbody.innerHTML = "";
  const rows = frequency.slice(0, 80);
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">沒有符合條件的頻率資料</td></tr>';
    return;
  }
  for (const item of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.rank}</td>
      <td><button class="link-button" type="button" data-focus="${escapeAttribute(item.focus)}">${escapeHtml(item.focus)}</button></td>
      <td>${item.count}</td>
      <td>${escapeHtml(item.subjects.join("、"))}</td>
      <td>${escapeHtml(item.smallSubjects.join("、"))}</td>
    `;
    tbody.appendChild(tr);
  }
  tbody.querySelectorAll("button[data-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filters.focus = button.dataset.focus;
      controls.focus.value = state.filters.focus;
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function renderQuestionRows(questions) {
  const tbody = $("questionRows");
  tbody.innerHTML = "";
  const rows = questions.slice(0, 260);
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty">沒有符合條件的題目</td></tr>';
    return;
  }
  for (const question of rows) {
    const tr = document.createElement("tr");
    const context = question.context ? `<div class="context">${escapeHtml(question.context)}</div>` : "";
    tr.innerHTML = `
      <td>${escapeHtml(question.year)}</td>
      <td>${escapeHtml(question.subject)}</td>
      <td>${escapeHtml(question.type)}</td>
      <td>${escapeHtml(String(question.number))}</td>
      <td>${escapeHtml(question.smallSubject)}</td>
      <td><span class="tag">${escapeHtml(question.focus)}</span></td>
      <td class="question-text">${context}${escapeHtml(question.question)}</td>
    `;
    tbody.appendChild(tr);
  }
  if (questions.length > rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="7" class="empty">目前顯示前 ${rows.length} 題。請縮小篩選或下載目前結果查看全部。</td>`;
    tbody.appendChild(tr);
  }
}

function renderSourceInfo() {
  $("sourceList").innerHTML = state.meta.sources.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("methodList").innerHTML = state.meta.method.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function render() {
  updateDependentOptions();
  const questions = filteredQuestions();
  const frequency = frequencyFromQuestions(questions);
  renderMetrics(questions, frequency);
  renderFocusList(frequency);
  renderFrequencyRows(frequency);
  renderQuestionRows(questions);
}

function resetFilters() {
  state.filters = { year: "", subject: "", smallSubject: "", type: "", focus: "", keyword: "" };
  for (const key of ["year", "subject", "smallSubject", "type", "focus"]) controls[key].value = "";
  controls.keyword.value = "";
  render();
}

function downloadCurrentCsv() {
  const questions = filteredQuestions();
  const headers = ["年份", "科目", "題型", "題號", "小科目", "本題重點", "共同情境", "題目內容"];
  const rows = questions.map((q) => [q.year, q.subject, q.type, q.number, q.smallSubject, q.focus, q.context, q.question]);
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "目前篩選結果.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

async function loadData() {
  const [questions, frequency, meta] = await Promise.all([
    fetch("./data/questions.json").then((response) => response.json()),
    fetch("./data/frequency.json").then((response) => response.json()),
    fetch("./data/meta.json").then((response) => response.json()),
  ]);
  state.questions = questions;
  state.frequency = frequency.focusFrequency;
  state.meta = meta;
}

function bindEvents() {
  for (const [key, element] of Object.entries(controls)) {
    const event = key === "keyword" ? "input" : "change";
    element.addEventListener(event, () => {
      state.filters[key] = element.value.trim();
      render();
    });
  }
  $("resetFilters").addEventListener("click", resetFilters);
  $("downloadCsv").addEventListener("click", downloadCurrentCsv);
}

loadData()
  .then(() => {
    bindEvents();
    renderSourceInfo();
    render();
  })
  .catch((error) => {
    document.body.innerHTML = `
      <main class="load-error">
        <h1>資料載入失敗</h1>
        <p>請確認此資料夾是透過 GitHub Pages 或本機靜態伺服器開啟，而不是直接用 file:// 開啟。</p>
        <pre>${escapeHtml(error.message)}</pre>
      </main>
    `;
  });
