(() => {
  const LEVEL_NAMES = new Proxy({}, { get: (_, k) => I18n.t("level." + k) });
  const $ = (id) => document.getElementById(id);
  const screens = { home: $("home"), game: $("game"), result: $("result"), tutorial: $("tutorial") };

  let level = "easy";
  let puzzle = [], solution = [];
  let cells = [];      // { value, notes: number[] }
  let selected = -1;
  let activeDigit = 0; // 当前选中的数字（0 表示未选）
  let history = [];
  let analysis = null; // 当前题目的逻辑分析结果（含使用到的技巧）
  let genToken = 0;    // 用于忽略已被取消的生成请求
  let saveEnabled = false; // 仅在棋盘进行中时自动保存
  const show = (name) => {
    for (const k in screens) screens[k].hidden = k !== name;
    if (name === "home") refreshHome();
  };

  // ---------- 本地存档（localStorage，仅保存一局，不含撤销记录） ----------
  const SAVE_KEY = "mysudoku-save-v1";

  function saveGame() {
    if (!saveEnabled || !analysis) return;
    try {
      const { steps, ...slim } = analysis; // 逐步记录体积大且恢复后不需要
      localStorage.setItem(SAVE_KEY, JSON.stringify({
        v: 1, level, puzzle, solution, analysis: slim, cells: cells.map((c) => [c.value, c.notes]),
      }));
    } catch (e) { /* 存储被禁用或已满：忽略，不影响游戏 */ }
  }

  function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 忽略 */ }
  }

  const validGrid = (g) => {
    for (let u = 0; u < 9; u++) {
      const r = new Set(), c = new Set(), b = new Set();
      for (let k = 0; k < 9; k++) {
        r.add(g[u * 9 + k]);
        c.add(g[k * 9 + u]);
        b.add(g[(Math.floor(u / 3) * 3 + Math.floor(k / 3)) * 9 + (u % 3) * 3 + (k % 3)]);
      }
      if (r.size !== 9 || c.size !== 9 || b.size !== 9) return false;
    }
    return true;
  };

  // 严格校验存档，任何异常都视为无存档
  function validSave(s) {
    const ints = (a, lo, hi) => Array.isArray(a) && a.length === 81 && a.every((x) => Number.isInteger(x) && x >= lo && x <= hi);
    return !!s && s.v === 1 && SudokuSolver.DIFFICULTY_CONFIG.order.includes(s.level) &&
      ints(s.puzzle, 0, 9) && ints(s.solution, 1, 9) && s.puzzle.every((v, i) => !v || v === s.solution[i]) &&
      validGrid(s.solution) &&
      !!s.analysis && typeof s.analysis.techniqueUsage === "object" && Number.isInteger(s.analysis.maxTier) &&
      Array.isArray(s.cells) && s.cells.length === 81 && s.cells.every((c, i) =>
        Array.isArray(c) && c.length === 2 && Number.isInteger(c[0]) && c[0] >= 0 && c[0] <= 9 &&
        Array.isArray(c[1]) && c[1].every((d) => Number.isInteger(d) && d >= 1 && d <= 9) &&
        (!s.puzzle[i] || c[0] === s.puzzle[i]) && (!c[0] || !c[1].length));
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (validSave(s)) return s;
      clearSave();
    } catch (e) { clearSave(); /* 数据损坏或存储不可用 */ }
    return null;
  }

  function refreshHome() {
    const s = loadSave();
    $("resume").hidden = !s;
    if (!s) return;
    const left = s.cells.filter((c) => !c[0]).length;
    $("resume-btn").textContent = I18n.t("home.resume", { level: LEVEL_NAMES[s.level], left });
  }

  function resumeGame() {
    const s = loadSave();
    if (!s) { refreshHome(); return; }
    genToken++;
    level = s.level;
    ({ puzzle, solution, analysis } = s);
    cells = s.cells.map(([value, notes]) => ({ value, notes: notes.slice().sort((a, b) => a - b) }));
    history = [];
    selected = -1;
    activeDigit = 0;
    saveEnabled = true;
    renderPad();
    $("game-title").textContent = I18n.t("game.title", { level: LEVEL_NAMES[level] });
    closeModal();
    show("game");
    render();
  }

  const snapshot = () => JSON.stringify(cells);

  const pushHistory = () => {
    history.push(snapshot());
  };

  function newCells() {
    return puzzle.map((v) => ({ value: v, notes: [] }));
  }

  function startGame(lv) {
    level = lv;
    saveEnabled = false;
    $("home-msg").textContent = "";
    analysis = null;
    const token = ++genToken;
    $("game-title").textContent = I18n.t("game.generating");
    show("game");
    // 延迟一帧让界面先刷新，再进行耗时的生成
    setTimeout(() => {
      if (token !== genToken) return;
      const r = SudokuGen.generatePuzzle(lv);
      if (!r.ok) {
        const why = I18n.t(r.reason === "timeout" ? "gen.timeout" : "gen.failed");
        $("home-msg").textContent = I18n.t("gen.msg", { why, level: LEVEL_NAMES[lv] });
        show("home");
        return;
      }
      ({ puzzle, solution, analysis } = r);
      resetBoard();
    }, 30);
  }

  // 返回首页：棋盘进行中时询问是否保存进度
  function goHome() {
    if (!screens.game.hidden && saveEnabled) {
      closeModal();
      $("leave-modal").hidden = false;
      return;
    }
    leaveToHome();
  }

  function leaveToHome() {
    genToken++;
    saveEnabled = false;
    closeModal();
    $("leave-modal").hidden = true;
    show("home");
  }

  // ---------- 技巧提示 ----------
  const modal = $("hint-modal");

  function closeModal() {
    modal.hidden = true;
  }

  function openModal(title, backToList) {
    $("modal-title").textContent = title;
    $("modal-back").hidden = !backToList;
    $("modal-body").innerHTML = "";
    $("modal-body").className = "";
    modal.hidden = false;
  }

  // 从当前盘面（已确定的数字）求下一步真实推理，并展示解释与高亮图
  function showNextStep(tier) {
    const t = SudokuSolver.TECHNIQUE_CONFIG;
    openModal(I18n.t(tier > 1 ? "hint.hardest" : "hint.next"), true);
    const body = $("modal-body");
    body.className = "help";
    const board = puzzle.map((v, i) => v || cells[i].value || 0);
    const r = SudokuSolver.analyzeSudoku(board, { hintTier: tier });
    if (r.error === "duplicate_given" || r.error === "contradiction") {
      body.textContent = I18n.t("hint.conflict");
    } else if (!r.hint) {
      body.textContent = I18n.t(r.solved ? "hint.none" : "hint.stuck");
    } else {
      Tutorial.renderHint(body, r.hint);
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = I18n.t("hint.full", { name: I18n.techName(r.hint.technique) });
      b.addEventListener("click", () => showTechniqueHelp(r.hint.technique));
      body.appendChild(b);
    }
    modal.querySelector(".modal-box").scrollTop = 0;
  }

  function showTechniqueList() {
    openModal(I18n.t("hint.title"), false);
    const body = $("modal-body");
    const usage = analysis ? analysis.techniqueUsage : {};
    const list = Object.keys(SudokuSolver.TECHNIQUE_CONFIG).filter((t) => usage[t]);
    if (!list.length) {
      body.textContent = I18n.t("hint.notReady");
      return;
    }
    const steps = document.createElement("div");
    steps.className = "tech-list";
    for (const [label, tier] of [[I18n.t("hint.btnNext"), 1], [I18n.t("hint.btnHardest"), analysis.maxTier]]) {
      const b = document.createElement("button");
      b.className = "btn tech-item";
      b.textContent = label;
      b.addEventListener("click", () => showNextStep(tier));
      steps.appendChild(b);
    }
    body.appendChild(steps);
    const tip = document.createElement("p");
    tip.className = "sub";
    tip.textContent = I18n.t("hint.listTip");
    body.appendChild(tip);
    const wrap = document.createElement("div");
    wrap.className = "tech-list";
    for (const t of list) {
      const cfg = SudokuSolver.TECHNIQUE_CONFIG[t];
      const b = document.createElement("button");
      b.className = "btn tech-item";
      b.innerHTML = `<span></span><span class="tier"></span>`;
      b.children[0].textContent = I18n.techName(t);
      b.children[1].textContent = `Tier ${cfg.tier}`;
      b.addEventListener("click", () => showTechniqueHelp(t));
      wrap.appendChild(b);
    }
    body.appendChild(wrap);
  }

  function showTechniqueHelp(t) {
    const cfg = SudokuSolver.TECHNIQUE_CONFIG[t];
    const help = SudokuSolver.TECHNIQUE_HELP[t];
    openModal(I18n.techFull(t), true);
    const body = $("modal-body");
    body.className = "help";
    Tutorial.renderLesson(body, t);
    modal.querySelector(".modal-box").scrollTop = 0;
  }

  // ---------- 技巧教学页（首页入口） ----------
  const TIER_KEYS = { 1: "tier.1", 2: "tier.2", 3: "tier.3", 4: "tier.4" };

  function showTutorialList() {
    $("tutorial-title").textContent = I18n.t("home.tutorial");
    const body = $("tutorial-body");
    body.innerHTML = "";
    const intro = document.createElement("p");
    intro.className = "sub";
    intro.textContent = I18n.t("tutorial.intro");
    body.appendChild(intro);
    Tutorial.renderBasics(body);
    for (const tier of [1, 2, 3, 4]) {
      const h = document.createElement("h4");
      h.textContent = I18n.t(TIER_KEYS[tier]);
      body.appendChild(h);
      const wrap = document.createElement("div");
      wrap.className = "tech-list";
      for (const [key, cfg] of Object.entries(SudokuSolver.TECHNIQUE_CONFIG)) {
        if (cfg.tier !== tier) continue;
        const b = document.createElement("button");
        b.className = "btn tech-item";
        b.innerHTML = "<span></span><span class=\"tier\"></span>";
        b.children[0].textContent = I18n.techFull(key);
        b.children[1].textContent = I18n.t("tutorial.view");
        b.addEventListener("click", () => showTutorialDetail(key));
        wrap.appendChild(b);
      }
      body.appendChild(wrap);
    }
    window.scrollTo(0, 0);
  }

  function showTutorialDetail(key) {
    $("tutorial-title").textContent = I18n.techName(key);
    const body = $("tutorial-body");
    body.innerHTML = "";
    Tutorial.renderLesson(body, key);
    window.scrollTo(0, 0);
    tutorialKey = key;
  }

  let tutorialKey = null;
  function tutorialBack() {
    if (tutorialKey) {
      tutorialKey = null;
      showTutorialList();
    } else {
      show("home");
    }
  }

  function resetBoard() {
    cells = newCells();
    history = [];
    selected = -1;
    activeDigit = 0;
    saveEnabled = true;
    renderPad();
    $("game-title").textContent = I18n.t("game.title", { level: LEVEL_NAMES[level] });
    show("game");
    render();
  }

  const isPeer = (a, b) =>
    a !== b && (Math.floor(a / 9) === Math.floor(b / 9) || a % 9 === b % 9 ||
      (Math.floor(a / 27) === Math.floor(b / 27) && Math.floor((a % 9) / 3) === Math.floor((b % 9) / 3)));

  function hasConflict(i) {
    const v = cells[i].value;
    return !!v && cells.some((c, j) => c.value === v && isPeer(i, j));
  }

  function render() {
    const board = $("board");
    board.innerHTML = "";
    const sel = selected >= 0 ? cells[selected] : null;
    cells.forEach((c, i) => {
      const el = document.createElement("div");
      el.className = "cell";
      if (hasConflict(i)) el.classList.add("conflict");
      if (puzzle[i]) el.classList.add("given");
      else if (c.value) el.classList.add("user");
      if (selected >= 0) {
        const r = Math.floor(i / 9), col = i % 9, sr = Math.floor(selected / 9), sc = selected % 9;
        if (i === selected) el.classList.add("selected");
        else if (c.value && c.value === (activeDigit || sel.value)) el.classList.add("same");
        else if (r === sr || col === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(col / 3) === Math.floor(sc / 3))) el.classList.add("related");
      }
      if (activeDigit && c.value === activeDigit) el.classList.add("same");
      if (c.value) el.textContent = c.value;
      else if (c.notes.length) el.appendChild(notesEl(c.notes));
      el.dataset.i = i;
      board.appendChild(el);
    });
    saveGame();
  }

  function notesEl(notes) {
    const n = document.createElement("div");
    n.className = "notes";
    for (let d = 1; d <= 9; d++) {
      const s = document.createElement("span");
      s.textContent = notes.includes(d) ? d : "";
      n.appendChild(s);
    }
    return n;
  }

  // 点击格子：放置/取消待定数字
  function placeNote(i, d) {
    const c = cells[i];
    if (puzzle[i] || c.value) return; // 已有确定数字的格子不能填待定数字
    pushHistory();
    const k = c.notes.indexOf(d);
    if (k >= 0) c.notes.splice(k, 1);
    else c.notes.push(d);
    c.notes.sort();
    render();
  }

  // 长按格子：放置确定数字，并清除该格待定数字及同行/列/宫的同数字待定标记
  function placeValue(i, d) {
    const c = cells[i];
    if (puzzle[i] || c.value === d) return;
    pushHistory();
    c.value = d;
    c.notes = [];
    cells.forEach((p, j) => {
      if (isPeer(i, j)) p.notes = p.notes.filter((n) => n !== d);
    });
    render();
  }

  function setActiveDigit(d) {
    activeDigit = activeDigit === d ? 0 : d;
    renderPad();
    render();
  }

  function renderPad() {
    document.querySelectorAll("#pad .btn").forEach((b) => b.classList.toggle("active", +b.textContent === activeDigit));
  }

  function undo() {
    if (!history.length) return;
    cells = JSON.parse(history.pop());
    render();
  }

  function clearCell() {
    if (selected < 0 || puzzle[selected]) return;
    const c = cells[selected];
    if (!c.value && !c.notes.length) return;
    pushHistory();
    c.value = 0;
    c.notes = [];
    render();
  }

  function clearAll() {
    if (!confirm(I18n.t("confirm.clearAll"))) return;
    pushHistory();
    cells = newCells();
    render();
  }

  function submit() {
    const empty = cells.filter((c) => !c.value).length;
    if (empty && !confirm(I18n.t("confirm.submit", { n: empty }))) return;
    saveEnabled = false;
    clearSave();
    const wrong = cells.map((c, i) => c.value !== solution[i]);
    const ok = !wrong.some(Boolean);
    $("result-title").textContent = I18n.t(ok ? "result.ok" : "result.bad");
    $("result-detail").textContent = ok
      ? I18n.t("result.okDetail")
      : I18n.t("result.badDetail", { n: wrong.filter(Boolean).length });
    const ans = $("answer");
    ans.innerHTML = "";
    solution.forEach((v, i) => {
      const el = document.createElement("div");
      el.className = "cell" + (puzzle[i] ? " given" : "") + (wrong[i] ? " wrong" : "");
      el.textContent = v;
      ans.appendChild(el);
    });
    renderResultTechniques();
    show("result");
  }

  // 结算页：显示本题实际用到的技巧（来自逻辑求解器的真实记录），点击可查看讲解
  function renderResultTechniques() {
    const box = $("result-techs");
    box.innerHTML = "";
    const rows = SudokuSolver.summarizeTechniques(analysis);
    box.hidden = !rows.length;
    if (!rows.length) return;
    const h = document.createElement("h4");
    h.textContent = I18n.t("result.techs");
    box.appendChild(h);
    const sum = document.createElement("p");
    sum.className = "sub";
    const lv = SudokuSolver.classifyDifficulty(analysis);
    sum.textContent = I18n.t("result.summary", {
      level: LEVEL_NAMES[lv], stars: "★".repeat(analysis.grade) + "☆".repeat(5 - analysis.grade), rating: analysis.rating,
      steps: analysis.stepCount, total: analysis.totalScore, cx: analysis.complexityScore, tier: analysis.maxTier,
    }) + (analysis.maxChainLength ? I18n.t("result.chain", { n: analysis.maxChainLength }) : "") + I18n.t("result.end");
    box.appendChild(sum);
    const wrap = document.createElement("div");
    wrap.className = "tech-list";
    for (const t of rows) {
      const b = document.createElement("button");
      b.className = "btn tech-item";
      b.innerHTML = "<span></span><span class=\"tier\"></span>";
      b.children[0].textContent = t.name + (t.hardest ? I18n.t("result.hardest") : "");
      b.children[1].textContent = I18n.t("result.techInfo", { tier: t.tier, count: t.count, points: t.points });
      b.addEventListener("click", () => showTechniqueHelp(t.key));
      wrap.appendChild(b);
    }
    box.appendChild(wrap);
  }

  document.querySelectorAll("[data-level]").forEach((b) =>
    b.addEventListener("click", () => {
      if (loadSave() && !confirm(I18n.t("confirm.overwrite"))) return;
      startGame(b.dataset.level);
    }));
  $("resume-btn").addEventListener("click", resumeGame);
  $("abandon").addEventListener("click", () => {
    if (!confirm(I18n.t("confirm.abandon"))) return;
    clearSave();
    refreshHome();
  });
  $("leave-save").addEventListener("click", () => { saveGame(); leaveToHome(); });
  $("leave-discard").addEventListener("click", () => { clearSave(); leaveToHome(); });
  $("leave-cancel").addEventListener("click", () => { $("leave-modal").hidden = true; });
  // 切到后台或关闭页面时再存一次（iPhone 切换应用时尤其重要）
  document.addEventListener("visibilitychange", () => { if (document.hidden) saveGame(); });
  window.addEventListener("pagehide", saveGame);
  // ---------- 多语言 ----------
  function applyLang() {
    document.documentElement.lang = { zh: "zh-CN", en: "en", fr: "fr" }[I18n.lang];
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = I18n.t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", I18n.t(el.dataset.i18nAria)));
    $("lang-select").value = I18n.lang;
    closeModal();
    $("home-msg").textContent = "";
    if (!screens.tutorial.hidden) { if (tutorialKey) showTutorialDetail(tutorialKey); else showTutorialList(); }
    if (!screens.game.hidden && analysis) $("game-title").textContent = I18n.t("game.title", { level: LEVEL_NAMES[level] });
    refreshHome();
  }
  $("lang-select").addEventListener("change", (e) => I18n.setLang(e.target.value));
  I18n.onChange(applyLang);
  applyLang();
  // 禁止 iOS 捏合缩放与双击放大
  ["gesturestart", "gesturechange", "gestureend"].forEach((n) => document.addEventListener(n, (e) => e.preventDefault()));
  document.addEventListener("dblclick", (e) => e.preventDefault());
  for (let d = 1; d <= 9; d++) {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = d;
    b.addEventListener("click", () => setActiveDigit(d));
    $("pad").appendChild(b);
  }

  // 棋盘手势：点击=待定数字，长按=确定数字（用事件委托，避免重绘后丢失监听）
  const LONG_PRESS_MS = 450;
  const MOVE_TOLERANCE = 10;
  let press = null; // { i, x, y, timer, long }
  const cellIndex = (e) => {
    const el = e.target.closest(".cell");
    return el ? +el.dataset.i : -1;
  };
  const cancelPress = () => {
    if (press) clearTimeout(press.timer);
    press = null;
  };
  const board = $("board");
  board.addEventListener("pointerdown", (e) => {
    const i = cellIndex(e);
    if (i < 0 || (e.pointerType === "mouse" && e.button !== 0)) return;
    cancelPress();
    press = { i, x: e.clientX, y: e.clientY, long: false };
    if (activeDigit) {
      press.timer = setTimeout(() => {
        if (!press) return;
        press.long = true;
        selected = press.i;
        const d = activeDigit;
        if (puzzle[press.i] || cells[press.i].value === d) render();
        else placeValue(press.i, d);
      }, LONG_PRESS_MS);
    }
  });
  board.addEventListener("pointermove", (e) => {
    if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > MOVE_TOLERANCE) cancelPress();
  });
  board.addEventListener("pointerup", () => {
    if (!press) return;
    const { i, long } = press;
    cancelPress();
    if (long) return;
    selected = i;
    if (activeDigit && !puzzle[i] && !cells[i].value) placeNote(i, activeDigit);
    else render();
  });
  board.addEventListener("pointercancel", cancelPress);
  board.addEventListener("contextmenu", (e) => e.preventDefault());
  $("undo").addEventListener("click", undo);
  $("clear-cell").addEventListener("click", clearCell);
  $("clear-all").addEventListener("click", clearAll);
  $("submit").addEventListener("click", submit);
  $("retry").addEventListener("click", resetBoard);
  $("home-btn").addEventListener("click", () => show("home"));
  $("back").addEventListener("click", goHome);
  $("open-tutorial").addEventListener("click", () => {
    tutorialKey = null;
    showTutorialList();
    show("tutorial");
  });
  $("tutorial-back").addEventListener("click", tutorialBack);
  $("hint").addEventListener("click", showTechniqueList);
  $("modal-back").addEventListener("click", showTechniqueList);
  $("modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  document.addEventListener("keydown", (e) => {
    if (screens.game.hidden) return;
    if (!modal.hidden) {
      if (e.key === "Escape") closeModal();
      return;
    }
    if (/^[1-9]$/.test(e.key)) setActiveDigit(+e.key);
    else if (e.key === " " && selected >= 0 && activeDigit) { placeNote(selected, activeDigit); e.preventDefault(); }
    else if (e.key === "Enter" && selected >= 0 && activeDigit) placeValue(selected, activeDigit);
    else if (e.key === "Backspace" || e.key === "Delete") clearCell();
    else if ((e.ctrlKey || e.metaKey) && e.key === "z") undo();
    else if (selected >= 0 && e.key.startsWith("Arrow")) {
      const r = Math.floor(selected / 9), c = selected % 9;
      const nr = Math.max(0, Math.min(8, r + (e.key === "ArrowDown") - (e.key === "ArrowUp")));
      const nc = Math.max(0, Math.min(8, c + (e.key === "ArrowRight") - (e.key === "ArrowLeft")));
      selected = nr * 9 + nc;
      render();
      e.preventDefault();
    }
  });
})();
