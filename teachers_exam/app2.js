const state = {
  questions: [],
  frequency: [],
  meta: null,
  selectedFocus: "",
  selectedSmallSubject: "",
};

const $ = (id) => document.getElementById(id);
const collator = new Intl.Collator("zh-Hant");

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => collator.compare(a, b));
}

function fillSelect(select, values, selectedValue) {
  select.innerHTML = "";
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  }
  select.value = values.includes(selectedValue) ? selectedValue : values[0] ?? "";
}

function focusOptions() {
  return state.frequency.map((item) => item.focus);
}

function smallSubjectOptions() {
  return uniqueSorted(state.questions.map((question) => question.smallSubject));
}

function questionsForFocus(focus) {
  return state.questions
    .filter((question) => question.focus === focus)
    .sort(
      (a, b) =>
        Number(a.year) - Number(b.year) ||
        collator.compare(a.subject, b.subject) ||
        collator.compare(a.type, b.type) ||
        Number(a.number) - Number(b.number)
    );
}

function conceptsForSmallSubject(smallSubject) {
  const map = new Map();
  for (const question of state.questions) {
    if (question.smallSubject !== smallSubject) continue;
    map.set(question.focus, (map.get(question.focus) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([focus, count]) => ({ focus, count }))
    .sort((a, b) => b.count - a.count || collator.compare(a.focus, b.focus));
}

function renderFocusOptions() {
  fillSelect($("focusSelect"), focusOptions(), state.selectedFocus);
  state.selectedFocus = $("focusSelect").value;
}

function renderSmallSubjectOptions() {
  fillSelect($("smallSubjectSelect"), smallSubjectOptions(), state.selectedSmallSubject);
  state.selectedSmallSubject = $("smallSubjectSelect").value;
}

function renderFocusResult(focus) {
  const rows = questionsForFocus(focus);
  $("focusCount").textContent = `${rows.length} 題`;
  const tbody = $("focusQuestionRows");
  tbody.innerHTML = "";

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">沒有找到這個概念的題目。</td></tr>';
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
      <td class="question-text">${context}${escapeHtml(question.question)}</td>
    `;
    tbody.appendChild(tr);
  }
}

function renderSmallSubjectResult(smallSubject) {
  const concepts = conceptsForSmallSubject(smallSubject);
  $("smallSubjectCount").textContent = `${concepts.length} 個概念`;
  const container = $("conceptList");
  container.innerHTML = "";

  if (concepts.length === 0) {
    container.innerHTML = '<p class="empty">沒有找到這個小科目的概念。</p>';
    return;
  }

  for (const item of concepts) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `concept-button${item.focus === state.selectedFocus ? " active" : ""}`;
    button.innerHTML = `
      <span>${escapeHtml(item.focus)}</span>
      <strong>${item.count} 題</strong>
    `;
    button.addEventListener("click", () => {
      state.selectedFocus = item.focus;
      $("focusSelect").value = item.focus;
      renderFocusResult(state.selectedFocus);
      renderSmallSubjectResult(state.selectedSmallSubject);
      document.querySelector("#focusTitle").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    container.appendChild(button);
  }
}

function renderFrequencyRows() {
  const tbody = $("frequencyRows");
  tbody.innerHTML = "";
  for (const item of state.frequency) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.rank}</td>
      <td><button class="link-button" type="button" data-focus="${escapeAttribute(item.focus)}">${escapeHtml(item.focus)}</button></td>
      <td>${item.count}</td>
      <td>${escapeHtml((item.subjects ?? []).join("、"))}</td>
      <td>${escapeHtml((item.smallSubjects ?? []).join("、"))}</td>
    `;
    tbody.appendChild(tr);
  }

  tbody.querySelectorAll("button[data-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedFocus = button.dataset.focus;
      $("focusSelect").value = state.selectedFocus;
      renderFocusResult(state.selectedFocus);
      renderSmallSubjectResult(state.selectedSmallSubject);
      document.querySelector("#focusTitle").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderSourceInfo() {
  $("sourceList").innerHTML = state.meta.sources.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  $("methodList").innerHTML = state.meta.method.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function bindEvents() {
  $("focusSelect").addEventListener("change", (event) => {
    state.selectedFocus = event.target.value;
    renderFocusResult(state.selectedFocus);
    renderSmallSubjectResult(state.selectedSmallSubject);
  });

  $("smallSubjectSelect").addEventListener("change", (event) => {
    state.selectedSmallSubject = event.target.value;
    renderSmallSubjectResult(state.selectedSmallSubject);
  });
}

function renderInitialView() {
  renderFocusOptions();
  renderSmallSubjectOptions();
  renderFocusResult(state.selectedFocus);
  renderSmallSubjectResult(state.selectedSmallSubject);
  renderFrequencyRows();
  renderSourceInfo();
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
  state.selectedFocus = state.frequency[0]?.focus ?? "";
  state.selectedSmallSubject = smallSubjectOptions()[0] ?? "";
}

loadData()
  .then(() => {
    bindEvents();
    renderInitialView();
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
