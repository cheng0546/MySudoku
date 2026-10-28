// 数独生成与求解（保证唯一解）。网格为长度 81 的数组，0 表示空格。
const SudokuGen = (() => {
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const boxOf = (i) => Math.floor(i / 27) * 3 + Math.floor(((i % 9) / 3));

  // 统计解的数量（最多 limit 个）；randomize 为 true 时随机尝试顺序，用于生成终盘
  function solve(grid, limit, randomize) {
    const g = grid.slice();
    const rows = new Array(9).fill(0);
    const cols = new Array(9).fill(0);
    const boxes = new Array(9).fill(0);
    for (let i = 0; i < 81; i++) {
      if (g[i]) {
        const bit = 1 << g[i];
        rows[Math.floor(i / 9)] |= bit;
        cols[i % 9] |= bit;
        boxes[boxOf(i)] |= bit;
      }
    }
    let count = 0;
    let firstSolution = null;

    const search = () => {
      // 选择候选数最少的空格
      let best = -1;
      let bestMask = 0;
      let bestCount = 10;
      for (let i = 0; i < 81; i++) {
        if (g[i]) continue;
        const used = rows[Math.floor(i / 9)] | cols[i % 9] | boxes[boxOf(i)];
        const mask = ~used & 0x3fe;
        let c = 0;
        for (let m = mask; m; m &= m - 1) c++;
        if (c < bestCount) {
          best = i;
          bestMask = mask;
          bestCount = c;
          if (c <= 1) break;
        }
      }
      if (best === -1) {
        count++;
        if (!firstSolution) firstSolution = g.slice();
        return count >= limit;
      }
      if (bestCount === 0) return false;
      const digits = [];
      for (let d = 1; d <= 9; d++) if (bestMask & (1 << d)) digits.push(d);
      if (randomize) shuffle(digits);
      const r = Math.floor(best / 9), c = best % 9, b = boxOf(best);
      for (const d of digits) {
        const bit = 1 << d;
        g[best] = d;
        rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
        const stop = search();
        rows[r] &= ~bit; cols[c] &= ~bit; boxes[b] &= ~bit;
        g[best] = 0;
        if (stop) return true;
      }
      return false;
    };
    search();
    return { count, solution: firstSolution };
  }

  // 随机顺序挖空，每次挖空后用回溯检查仍为唯一解，直到提示数降到目标值
  function dig(solution, target) {
    const puzzle = solution.slice();
    let clues = 81;
    for (const i of shuffle([...Array(81).keys()])) {
      if (clues <= target) break;
      const backup = puzzle[i];
      puzzle[i] = 0;
      if (solve(puzzle, 2, false).count !== 1) puzzle[i] = backup;
      else clues--;
    }
    return puzzle;
  }

  // 各目标难度的生成统计：{ attempts, successes, ms, failures }
  const stats = {};

  // 生成指定难度的题目；难度由逻辑求解器（SudokuSolver）确认，不会返回其他难度的题。
  // 成功：{ ok: true, puzzle, solution, difficulty, analysis, attempts, ms }
  // 失败：{ ok: false, reason: "invalid_difficulty" | "max_attempts" | "timeout", attempts, ms }
  function generatePuzzle(targetDifficulty) {
    const cfg = SudokuSolver.DIFFICULTY_CONFIG;
    const range = cfg.clues[targetDifficulty];
    const st = (stats[targetDifficulty] = stats[targetDifficulty] || { attempts: 0, successes: 0, ms: 0, failures: 0 });
    if (!range) return { ok: false, reason: "invalid_difficulty", attempts: 0, ms: 0 };

    const start = Date.now();
    let attempts = 0;
    let reason = "max_attempts";
    while (true) {
      if (attempts >= cfg.maxAttempts) break;
      if (Date.now() - start > cfg.maxMillis) { reason = "timeout"; break; }
      attempts++;
      const solution = solve(new Array(81).fill(0), 1, true).solution;
      const target = range[0] + Math.floor(Math.random() * (range[1] - range[0] + 1));
      const puzzle = dig(solution, target);
      // 先确认唯一解，再做（较慢的）难度分析
      if (solve(puzzle, 2, false).count !== 1) continue;
      const analysis = SudokuSolver.analyzeSudoku(puzzle);
      if (!analysis.solved) continue;
      const difficulty = SudokuSolver.classifyDifficulty(analysis);
      if (difficulty !== targetDifficulty) continue;
      const ms = Date.now() - start;
      st.attempts += attempts; st.successes++; st.ms += ms;
      return { ok: true, puzzle, solution, difficulty, analysis, attempts, ms };
    }
    const ms = Date.now() - start;
    st.attempts += attempts; st.failures++; st.ms += ms;
    return { ok: false, reason, attempts, ms };
  }

  return { generatePuzzle, solve, stats };
})();