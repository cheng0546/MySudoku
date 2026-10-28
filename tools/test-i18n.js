// 多语言完整性测试：node tools/test-i18n.js
// 检查三种语言的界面字典键、教学内容（每个技巧的说明/课程结构）是否齐全，并用真实题目检查推理说明没有残留占位符。
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const files = ["i18n/core", "i18n/zh", "i18n/en", "i18n/fr", "i18n/content-en-1", "i18n/content-en-2", "i18n/content-fr-1", "i18n/content-fr-2",
  ...["config", "help", "core", "patterns", "chains", "als", "forcing", "analyze"].map((n) => `solver/${n}`), "sudoku"];
for (const f of files) {
  vm.runInThisContext(`${fs.readFileSync(path.join(root, f + ".js"), "utf8")}\n${f === "sudoku" ? "globalThis.SudokuGen = SudokuGen;" : ""}`);
}
vm.runInThisContext("globalThis.SudokuSolver = SudokuSolver; globalThis.I18n = I18n;");

// 取出 tutorial.js 中的中文课程结构作为对照
const src = fs.readFileSync(path.join(root, "tutorial.js"), "utf8").replace("return { renderLesson, renderBasics, renderHint };", "return { LESSONS, BASICS };");
const T = vm.runInNewContext(src + "\nTutorial;", { document: {} });

let bad = 0;
const fail = (m) => { bad++; console.log("✗", m); };
const keys = Object.keys(SudokuSolver.TECHNIQUE_CONFIG);

const zhKeys = I18n.keys("zh");
for (const lang of ["en", "fr"]) {
  const have = new Set(I18n.keys(lang));
  for (const k of zhKeys) if (!have.has(k)) fail(`${lang}: missing UI key ${k}`);
  I18n.setLang(lang);
  const c = I18n.getContent();
  if (!c.basics || c.basics.length !== T.BASICS.length) fail(`${lang}: basics`);
  for (const k of keys) {
    const h = c.help && c.help[k], l = c.lessons && c.lessons[k], z = T.LESSONS[k];
    if (!h || !h.summary || !h.how) { fail(`${lang}: help ${k}`); continue; }
    if (!l || l.terms.length !== z.terms.length || l.sections.length !== z.sections.length || !!l.tip !== !!z.tip) fail(`${lang}: lesson shape ${k}`);
    else z.sections.forEach((s, i) => {
      if (!l.sections[i].h || !l.sections[i].t) fail(`${lang}: lesson text ${k}#${i}`);
      for (const m of Object.keys(s.d.lab || {})) if (!(l.sections[i].lab && l.sections[i].lab[m])) fail(`${lang}: legend ${k}#${i}.${m}`);
    });
  }
}

// 用真实题目的推理步骤检查每种语言的说明
const seen = new Set();
const puzzles = [];
for (const lv of ["medium", "hard", "expert", "expert", "expert"]) {
  const r = SudokuGen.generatePuzzle(lv);
  if (r.ok) puzzles.push(r.puzzle);
}
for (const lang of ["zh", "en", "fr"]) {
  I18n.setLang(lang);
  for (const p of puzzles) {
    for (const s of SudokuSolver.analyzeSudoku(p).steps) {
      seen.add(s.technique);
      if (/\{(?!R\d)[a-zA-Z_]\w*\}|\br\.[a-z_]+\b|undefined|NaN/.test(s.reason)) fail(`${lang}: reason ${s.technique}: ${s.reason}`);
    }
  }
  console.log(lang, "techniques:", SudokuSolver.summarizeTechniques(SudokuSolver.analyzeSudoku(puzzles[0])).map((t) => t.name).slice(0, 4).join(" | "));
}
console.log(`checked reasons for ${seen.size} techniques`);
console.log(bad ? `FAILED (${bad})` : "OK");
process.exit(bad ? 1 : 0);
