// 难度系统测试：node tools/test-difficulty.js [每个难度的题数，默认 20]
// 校验唯一解、逻辑求解结果与难度约束，并输出各难度的尝试次数、耗时和技巧使用统计。
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const SOLVER_FILES = ["config", "help", "core", "patterns", "chains", "als", "forcing", "analyze"].map((n) => `solver/${n}.js`);
for (const [file, name] of [...SOLVER_FILES.map((f) => [f, null]), ["sudoku.js", "SudokuGen"]]) {
  vm.runInThisContext(`${fs.readFileSync(path.join(root, file), "utf8")}\n${name ? `globalThis.${name} = ${name};` : ""}`);
}
vm.runInThisContext("globalThis.SudokuSolver = SudokuSolver;");

const N = +process.argv[2] || 20;
const { TECHNIQUE_CONFIG, DIFFICULTY_CONFIG, analyzeSudoku, classifyDifficulty } = SudokuSolver;
let failed = 0;
const check = (cond, msg) => { if (!cond) { failed++; console.log("  ✗ " + msg); } };

for (const level of DIFFICULTY_CONFIG.order) {
  const usage = {}, grades = {}, ratings = [];
  let ok = 0, fail = 0, attempts = 0, ms = 0, maxMs = 0, clues = 0, score = 0;
  for (let n = 0; n < N; n++) {
    const r = SudokuGen.generatePuzzle(level);
    attempts += r.attempts; ms += r.ms; maxMs = Math.max(maxMs, r.ms);
    if (!r.ok) { fail++; continue; }
    ok++;
    const a = r.analysis;
    const before = JSON.stringify(r.puzzle);
    const again = analyzeSudoku(r.puzzle);
    check(JSON.stringify(r.puzzle) === before, "analyzeSudoku 修改了输入");
    check(SudokuGen.solve(r.puzzle, 2, false).count === 1, "不是唯一解");
    check(again.solved && JSON.stringify(again.steps) === JSON.stringify(a.steps), "重复分析结果不稳定");
    check(classifyDifficulty(a) === level, `难度不一致 ${classifyDifficulty(a)} != ${level}`);
    check(a.stepCount === a.steps.length, "stepCount 与 steps 不符");
    check(a.totalScore === a.steps.reduce((s, x) => s + x.score, 0), "totalScore 与 steps 不符");
    // 逻辑步骤合法性：填入的数字必须等于唯一解，且不能排除正确答案
    check(a.steps.every((s) => s.action !== "place" || r.solution[s.row * 9 + s.col] === s.value), "逻辑填数与答案不符");
    check(a.steps.every((s) => s.eliminatedCandidates.every((e) => r.solution[e.row * 9 + e.col] !== e.value)), "排除了正确答案的候选数");
    if (level === "easy") check(a.maxTier === 1, "简单题使用了 Tier 1 以外的技巧");
    if (level === "medium") check(a.maxTier <= 2, "中等题使用了高于 Tier 2 的技巧");
    if (level === "expert") check(a.maxTier === 4, "专家题没有使用 Tier 4 技巧");
    for (const [t, c] of Object.entries(a.techniqueUsage)) usage[t] = (usage[t] || 0) + c;
    clues += r.puzzle.filter(Boolean).length;
    score += a.totalScore;
    grades[a.grade] = (grades[a.grade] || 0) + 1;
    ratings.push(a.rating);
    check(a.rating === a.totalScore + a.complexityScore && a.grade >= 1 && a.grade <= 5, "rating/grade 异常");
  }
  ratings.sort((x, y) => x - y);
  console.log(`\n[${DIFFICULTY_CONFIG.names[level]}] 成功 ${ok}/${N}，失败 ${fail}，总尝试 ${attempts}，平均耗时 ${(ms / N).toFixed(0)}ms，最长 ${maxMs}ms`);
  if (ok) console.log(`  平均提示数 ${(clues / ok).toFixed(1)}，平均总分 ${(score / ok).toFixed(0)}，难度分 ${ratings[0]}~${ratings[ratings.length - 1]}（中位 ${ratings[ratings.length >> 1]}），星级分布 ${[1, 2, 3, 4, 5].map((g) => g + "★=" + (grades[g] || 0)).join(" ")}`);
  console.log("  技巧使用:", Object.keys(TECHNIQUE_CONFIG).filter((t) => usage[t]).map((t) => `${t}=${usage[t]}`).join(" "));
}

// 非法输入
check(analyzeSudoku([1, 2, 3]).error === "invalid_input", "短数组应报 invalid_input");
const dup = new Array(81).fill(0); dup[0] = 5; dup[1] = 5;
check(analyzeSudoku(dup).error === "duplicate_given", "重复数字应报 duplicate_given");
check(analyzeSudoku(new Array(81).fill(0)).solved === false, "空棋盘不应被逻辑解出");

console.log(failed ? `\n失败项: ${failed}` : "\n全部检查通过");
process.exit(failed ? 1 : 0);
