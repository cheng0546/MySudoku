(() => {
  const LEVEL_NAMES = SudokuSolver.DIFFICULTY_CONFIG.names;
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
  const show = (name) => {
    for (const k in screens) screens[k].hidden = k !== name;
  };

  const snapshot = () => JSON.stringify(cells);

  const pushHistory = () => {
    history.push(snapshot());
  };

  function newCells() {
    return puzzle.map((v) => ({ value: v, notes: [] }));
  }

  function startGame(lv) {
    level = lv;
    $("home-msg").textContent = "";
    analysis = null;
    const token = ++genToken;
    $("game-title").textContent = "生成中…";
    show("game");
    // 延迟一帧让界面先刷新，再进行耗时的生成
    setTimeout(() => {
      if (token !== genToken) return;
      const r = SudokuGen.generatePuzzle(lv);
      if (!r.ok) {
        const why = r.reason === "timeout" ? "生成超时" : "多次尝试仍未生成符合要求的题目";
        $("home-msg").textContent = `${why}（${LEVEL_NAMES[lv]}），请重试或选择其他难度。`;
        show("home");
        return;
      }
      ({ puzzle, solution, analysis } = r);
      resetBoard();
    }, 30);
  }

  function goHome() {
    if (!screens.game.hidden && history.length && !confirm("返回首页将放弃当前进度，确定吗？")) return;
    genToken++;
    closeModal();
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

  function showTechniqueList() {
    openModal("本题可能用到的技巧", false);
    const body = $("modal-body");
    const usage = analysis ? analysis.techniqueUsage : {};
    const list = Object.keys(SudokuSolver.TECHNIQUE_CONFIG).filter((t) => usage[t]);
    if (!list.length) {
      body.textContent = "题目尚未生成。";
      return;
    }
    const tip = document.createElement("p");
    tip.className = "sub";
    tip.textContent = "点击技巧查看讲解：";
    body.appendChild(tip);
    const wrap = document.createElement("div");
    wrap.className = "tech-list";
    for (const t of list) {
      const cfg = SudokuSolver.TECHNIQUE_CONFIG[t];
      const b = document.createElement("button");
      b.className = "btn tech-item";
      b.innerHTML = `<span></span><span class="tier"></span>`;
      b.children[0].textContent = cfg.name;
      b.children[1].textContent = `Tier ${cfg.tier}`;
      b.addEventListener("click", () => showTechniqueHelp(t));
      wrap.appendChild(b);
    }
    body.appendChild(wrap);
  }

  function showTechniqueHelp(t) {
    const cfg = SudokuSolver.TECHNIQUE_CONFIG[t];
    const help = SudokuSolver.TECHNIQUE_HELP[t];
    openModal(`${cfg.name}（${cfg.nameEn}）`, true);
    const body = $("modal-body");
    body.className = "help";
    Tutorial.renderLesson(body, t);
    modal.querySelector(".modal-box").scrollTop = 0;
  }

  // ---------- 技巧教学页（首页入口） ----------
  const TIER_TITLES = { 1: "Tier 1 基础（简单）", 2: "Tier 2 中级（中等）", 3: "Tier 3 高级（困难）", 4: "Tier 4 专家" };

  function showTutorialList() {
    $("tutorial-title").textContent = "技巧教学";
    const body = $("tutorial-body");
    body.innerHTML = "";
    const intro = document.createElement("p");
    intro.className = "sub";
    intro.textContent = "这里收录了出题时可能用到的全部技巧，点击查看图文讲解。";
    body.appendChild(intro);
    Tutorial.renderBasics(body);
    for (const tier of [1, 2, 3, 4]) {
      const h = document.createElement("h4");
      h.textContent = TIER_TITLES[tier];
      body.appendChild(h);
      const wrap = document.createElement("div");
      wrap.className = "tech-list";
      for (const [key, cfg] of Object.entries(SudokuSolver.TECHNIQUE_CONFIG)) {
        if (cfg.tier !== tier) continue;
        const b = document.createElement("button");
        b.className = "btn tech-item";
        b.innerHTML = "<span></span><span class=\"tier\">查看 ›</span>";
        b.children[0].textContent = `${cfg.name}（${cfg.nameEn}）`;
        b.addEventListener("click", () => showTutorialDetail(key));
        wrap.appendChild(b);
      }
      body.appendChild(wrap);
    }
    window.scrollTo(0, 0);
  }

  function showTutorialDetail(key) {
    const cfg = SudokuSolver.TECHNIQUE_CONFIG[key];
    $("tutorial-title").textContent = cfg.name;
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
    renderPad();
    $("game-title").textContent = `难度：${LEVEL_NAMES[level]}`;
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
    if (!confirm("确定清除所有标记并重新开始吗？")) return;
    pushHistory();
    cells = newCells();
    render();
  }

  function submit() {
    const empty = cells.filter((c) => !c.value).length;
    if (empty && !confirm(`还有 ${empty} 个空格未填，确定提交吗？`)) return;
    const wrong = cells.map((c, i) => c.value !== solution[i]);
    const ok = !wrong.some(Boolean);
    $("result-title").textContent = ok ? "🎉 回答正确！" : "❌ 回答错误";
    $("result-detail").textContent = ok
      ? "恭喜你，成功解出了这道数独！"
      : `共有 ${wrong.filter(Boolean).length} 个格子有误或未填（红色标出）。`;
    const ans = $("answer");
    ans.innerHTML = "";
    solution.forEach((v, i) => {
      const el = document.createElement("div");
      el.className = "cell" + (puzzle[i] ? " given" : "") + (wrong[i] ? " wrong" : "");
      el.textContent = v;
      ans.appendChild(el);
    });
    show("result");
  }

  document.querySelectorAll("[data-level]").forEach((b) =>
    b.addEventListener("click", () => startGame(b.dataset.level)));
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
