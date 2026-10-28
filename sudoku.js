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

  // 保留的提示数范围
  const CLUES = { easy: [40, 45], medium: [32, 36], hard: [26, 30] };

  function generate(difficulty) {
    const solution = solve(new Array(81).fill(0), 1, true).solution;
    const [min, max] = CLUES[difficulty] || CLUES.easy;
    const target = min + Math.floor(Math.random() * (max - min + 1));
    const puzzle = solution.slice();
    let clues = 81;
    for (const i of shuffle([...Array(81).keys()])) {
      if (clues <= target) break;
      const backup = puzzle[i];
      puzzle[i] = 0;
      if (solve(puzzle, 2, false).count !== 1) puzzle[i] = backup;
      else clues--;
    }
    return { puzzle, solution };
  }

  return { generate, solve };
})();
