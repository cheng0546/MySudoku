// 数独逻辑求解器与难度评估。只使用人类可用的逻辑技巧，绝不回溯猜数。
// 棋盘格式与项目一致：长度 81 的数组，0 表示空格（也接受 9×9 二维数组）。
const SudokuSolver = (() => {
  // ---------- 集中配置 ----------
  // 技巧配置：顺序即扫描顺序（从简单到复杂）。
  const TECHNIQUE_CONFIG = {
    naked_single:      { name: "唯一候选数", nameEn: "Naked Single",      tier: 1, score: 1 },
    hidden_single:     { name: "唯一位置",   nameEn: "Hidden Single",     tier: 1, score: 2 },
    locked_candidates: { name: "区块摒除",   nameEn: "Locked Candidates", tier: 2, score: 4 },
    naked_pair:        { name: "裸数对",     nameEn: "Naked Pair",        tier: 2, score: 4 },
    hidden_pair:       { name: "隐性数对",   nameEn: "Hidden Pair",       tier: 2, score: 5 },
    naked_triple:      { name: "裸三数组",   nameEn: "Naked Triple",      tier: 2, score: 8 },
    x_wing:            { name: "X-Wing",     nameEn: "X-Wing",            tier: 3, score: 12 },
    xy_wing:           { name: "XY-Wing",    nameEn: "XY-Wing",           tier: 3, score: 14 },
    xyz_wing:          { name: "XYZ-Wing",   nameEn: "XYZ-Wing",          tier: 4, score: 18 },
    swordfish:         { name: "Swordfish",  nameEn: "Swordfish",         tier: 4, score: 20 },
    xy_chain:          { name: "XY-Chain",   nameEn: "XY-Chain",          tier: 4, score: 22 },
  };

  // 难度配置：分数阈值、目标提示数范围、生成限制。
  const DIFFICULTY_CONFIG = {
    order: ["easy", "medium", "hard", "expert"],
    names: { easy: "简单", medium: "中等", hard: "困难", expert: "专家" },
    thresholds: {
      easyMaxScore: 100,    // Tier 1 且分数 ≤ 此值 → 简单，否则中等
      mediumMaxScore: 260,  // Tier 2 且分数 ≤ 此值 → 中等，否则困难
    },
    // 挖空目标（保留的提示数范围）。仅用于生成，最终难度由逻辑求解器确认。
    clues: { easy: [38, 45], medium: [30, 36], hard: [24, 30], expert: [17, 26] },
    maxAttempts: 4000,
    maxMillis: 20000,
  };

  const TECHNIQUE_ORDER = Object.keys(TECHNIQUE_CONFIG);

  // ---------- 预计算 ----------
  const UNITS = [];
  for (let r = 0; r < 9; r++) UNITS.push([...Array(9).keys()].map((c) => r * 9 + c));
  for (let c = 0; c < 9; c++) UNITS.push([...Array(9).keys()].map((r) => r * 9 + c));
  for (let b = 0; b < 9; b++) {
    const br = Math.floor(b / 3) * 3, bc = (b % 3) * 3;
    const u = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) u.push((br + r) * 9 + bc + c);
    UNITS.push(u);
  }
  const rowOf = (i) => Math.floor(i / 9);
  const colOf = (i) => i % 9;
  const boxOf = (i) => Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3);

  const SEES = Array.from({ length: 81 }, () => new Array(81).fill(false));
  const PEERS = Array.from({ length: 81 }, () => []);
  for (let a = 0; a < 81; a++) {
    for (let b = 0; b < 81; b++) {
      if (a !== b && (rowOf(a) === rowOf(b) || colOf(a) === colOf(b) || boxOf(a) === boxOf(b))) {
        SEES[a][b] = true;
        PEERS[a].push(b);
      }
    }
  }

  const POP = new Array(1024).fill(0);
  for (let m = 1; m < 1024; m++) POP[m] = POP[m >> 1] + (m & 1);
  const digitsOf = (mask) => {
    const out = [];
    for (let d = 1; d <= 9; d++) if (mask & (1 << d)) out.push(d);
    return out;
  };
  const rc = (i) => ({ row: rowOf(i), col: colOf(i) });
  const unitName = (u) => (u < 9 ? `第${u + 1}行` : u < 18 ? `第${u - 8}列` : `第${u - 17}宫`);

  // 从 k 个元素中选 n 个的所有组合
  function combos(arr, n, fn) {
    const pick = [];
    const rec = (start) => {
      if (pick.length === n) return fn(pick);
      for (let i = start; i < arr.length; i++) {
        pick.push(arr[i]);
        const r = rec(i + 1);
        pick.pop();
        if (r) return r;
      }
      return null;
    };
    return rec(0);
  }

  // ---------- 技巧实现 ----------
  // 每个技巧接收 state={values,cands}，返回可执行的操作或 null：
  //   {action:"place", cell, value, reason}
  //   {action:"eliminate", elims:[[cell,digit],...], cells, values, reason}
  // 排除操作只包含当前确实存在的候选数，保证每次操作都有实际进展。
  const place = (cell, value, reason) => ({ action: "place", cell, value, cells: [cell], values: [value], reason });
  function eliminate(s, pairs, cells, values, reason) {
    const elims = pairs.filter(([c, d]) => s.cands[c] & (1 << d));
    return elims.length ? { action: "eliminate", elims, cells, values, reason } : null;
  }

  const FINDERS = {
    naked_single(s) {
      for (let i = 0; i < 81; i++) {
        if (!s.values[i] && POP[s.cands[i]] === 1) {
          const d = digitsOf(s.cands[i])[0];
          return place(i, d, `该格只剩候选数 ${d}`);
        }
      }
      return null;
    },

    hidden_single(s) {
      for (let u = 0; u < 27; u++) {
        for (let d = 1; d <= 9; d++) {
          let only = -1, n = 0;
          for (const c of UNITS[u]) {
            if (!s.values[c] && s.cands[c] & (1 << d)) { only = c; n++; }
          }
          if (n === 1) return place(only, d, `${unitName(u)}中数字 ${d} 只能填在这一格`);
        }
      }
      return null;
    },

    // 区块摒除：包含 pointing（宫→行/列）与 claiming（行/列→宫）
    locked_candidates(s) {
      for (let d = 1; d <= 9; d++) {
        const bit = 1 << d;
        for (let b = 18; b < 27; b++) {
          const cs = UNITS[b].filter((c) => !s.values[c] && s.cands[c] & bit);
          if (cs.length < 2) continue;
          const sameRow = cs.every((c) => rowOf(c) === rowOf(cs[0]));
          const sameCol = cs.every((c) => colOf(c) === colOf(cs[0]));
          for (const [ok, u] of [[sameRow, rowOf(cs[0])], [sameCol, 9 + colOf(cs[0])]]) {
            if (!ok) continue;
            const targets = UNITS[u].filter((c) => boxOf(c) !== b - 18).map((c) => [c, d]);
            const r = eliminate(s, targets, cs, [d], `${unitName(b)}中数字 ${d} 只出现在${unitName(u)}，该行/列其余格不能是 ${d}`);
            if (r) return r;
          }
        }
        for (let u = 0; u < 18; u++) {
          const cs = UNITS[u].filter((c) => !s.values[c] && s.cands[c] & bit);
          if (cs.length < 2) continue;
          if (!cs.every((c) => boxOf(c) === boxOf(cs[0]))) continue;
          const b = boxOf(cs[0]);
          const targets = UNITS[18 + b].filter((c) => !cs.includes(c)).map((c) => [c, d]);
          const r = eliminate(s, targets, cs, [d], `${unitName(u)}中数字 ${d} 只出现在${unitName(18 + b)}，该宫其余格不能是 ${d}`);
          if (r) return r;
        }
      }
      return null;
    },

    naked_pair: (s) => nakedSubset(s, 2),
    naked_triple: (s) => nakedSubset(s, 3),

    hidden_pair(s) {
      for (let u = 0; u < 27; u++) {
        const pos = new Array(10).fill(0); // 数字 → 所在格子位掩码（单元内下标）
        UNITS[u].forEach((c, k) => {
          if (s.values[c]) return;
          for (const d of digitsOf(s.cands[c])) pos[d] |= 1 << k;
        });
        for (let a = 1; a <= 9; a++) {
          if (POP[pos[a]] !== 2) continue;
          for (let b = a + 1; b <= 9; b++) {
            if (pos[b] !== pos[a]) continue;
            const cells = UNITS[u].filter((_, k) => pos[a] & (1 << k));
            const keep = (1 << a) | (1 << b);
            const targets = [];
            for (const c of cells) for (const d of digitsOf(s.cands[c] & ~keep)) targets.push([c, d]);
            const r = eliminate(s, targets, cells, [a, b], `${unitName(u)}中数字 ${a}、${b} 只出现在这两格，这两格的其他候选数可排除`);
            if (r) return r;
          }
        }
      }
      return null;
    },

    x_wing: (s) => fish(s, 2),
    swordfish: (s) => fish(s, 3),

    // XY-Wing：枢纽格 {x,y}，两翼 {x,z}、{y,z}，同时看到两翼的格子排除 z
    xy_wing(s) {
      for (let p = 0; p < 81; p++) {
        if (s.values[p] || POP[s.cands[p]] !== 2) continue;
        for (const a of PEERS[p]) {
          if (s.values[a] || POP[s.cands[a]] !== 2) continue;
          const shared = s.cands[a] & s.cands[p];
          if (POP[shared] !== 1) continue;
          const zMask = s.cands[a] & ~shared;
          const bMask = (s.cands[p] & ~shared) | zMask;
          for (const b of PEERS[p]) {
            if (b <= a || s.values[b] || s.cands[b] !== bMask) continue;
            const z = digitsOf(zMask)[0];
            const targets = [];
            for (let c = 0; c < 81; c++) if (c !== p && c !== a && c !== b && SEES[c][a] && SEES[c][b]) targets.push([c, z]);
            const r = eliminate(s, targets, [p, a, b], [z], `XY-Wing：枢纽 ${rcText(p)}，两翼 ${rcText(a)}、${rcText(b)}，同时看到两翼的格子不能是 ${z}`);
            if (r) return r;
          }
        }
      }
      return null;
    },

    // XYZ-Wing：枢纽格 {x,y,z}，两翼 {x,z}、{y,z}，同时看到三格的格子排除 z
    xyz_wing(s) {
      for (let p = 0; p < 81; p++) {
        if (s.values[p] || POP[s.cands[p]] !== 3) continue;
        const wings = PEERS[p].filter((c) => !s.values[c] && POP[s.cands[c]] === 2 && (s.cands[c] & ~s.cands[p]) === 0);
        for (let i = 0; i < wings.length; i++) {
          for (let j = i + 1; j < wings.length; j++) {
            const a = wings[i], b = wings[j];
            if ((s.cands[a] | s.cands[b]) !== s.cands[p]) continue;
            const common = s.cands[a] & s.cands[b];
            if (POP[common] !== 1) continue;
            const z = digitsOf(common)[0];
            const targets = [];
            for (let c = 0; c < 81; c++) if (c !== p && c !== a && c !== b && SEES[c][p] && SEES[c][a] && SEES[c][b]) targets.push([c, z]);
            const r = eliminate(s, targets, [p, a, b], [z], `XYZ-Wing：枢纽 ${rcText(p)}，两翼 ${rcText(a)}、${rcText(b)}，同时看到三格的格子不能是 ${z}`);
            if (r) return r;
          }
        }
      }
      return null;
    },

    // XY-Chain：由双候选格组成的链（≥3 格），链两端必有一端为 a，同时看到两端的格子排除 a
    xy_chain(s) {
      const MAX_LEN = 10;
      const bivalue = [];
      for (let i = 0; i < 81; i++) if (!s.values[i] && POP[s.cands[i]] === 2) bivalue.push(i);
      for (const start of bivalue) {
        for (const a of digitsOf(s.cands[start])) {
          const link0 = digitsOf(s.cands[start] & ~(1 << a))[0];
          const path = [start];
          const dfs = (cur, link) => {
            for (const n of bivalue) {
              if (path.includes(n) || !SEES[cur][n] || !(s.cands[n] & (1 << link))) continue;
              const other = digitsOf(s.cands[n] & ~(1 << link))[0];
              if (other === a) {
                if (path.length < 2) continue;
                const targets = [];
                for (let c = 0; c < 81; c++) if (c !== start && c !== n && SEES[c][start] && SEES[c][n]) targets.push([c, a]);
                const r = eliminate(s, targets, [...path, n], [a], `XY-Chain：${[...path, n].map(rcText).join(" → ")}，链两端至少有一端为 ${a}，同时看到两端的格子不能是 ${a}`);
                if (r) return r;
              } else if (path.length + 1 < MAX_LEN) {
                path.push(n);
                const r = dfs(n, other);
                path.pop();
                if (r) return r;
              }
            }
            return null;
          };
          const r = dfs(start, link0);
          if (r) return r;
        }
      }
      return null;
    },
  };

  const rcText = (i) => `R${rowOf(i) + 1}C${colOf(i) + 1}`;

  // 裸数组（n=2 数对，n=3 三数组）：n 个格子的候选数并集恰好 n 个，单元内其他格排除这些数
  function nakedSubset(s, n) {
    for (let u = 0; u < 27; u++) {
      const cells = UNITS[u].filter((c) => !s.values[c] && POP[s.cands[c]] >= 2 && POP[s.cands[c]] <= n);
      const r = combos(cells, n, (group) => {
        const union = group.reduce((m, c) => m | s.cands[c], 0);
        if (POP[union] !== n) return null;
        const targets = [];
        for (const c of UNITS[u]) {
          if (s.values[c] || group.includes(c)) continue;
          for (const d of digitsOf(s.cands[c] & union)) targets.push([c, d]);
        }
        return eliminate(s, targets, [...group], digitsOf(union), `${unitName(u)}中 ${group.map(rcText).join("、")} 的候选数只含 ${digitsOf(union).join("、")}，同一${u < 9 ? "行" : u < 18 ? "列" : "宫"}其他格可排除这些数`);
      });
      if (r) return r;
    }
    return null;
  }

  // 鱼形结构（n=2 X-Wing，n=3 Swordfish），行基与列基各检查一次
  function fish(s, n) {
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << d;
      for (const byRow of [true, false]) {
        const cellAt = (line, cross) => (byRow ? line * 9 + cross : cross * 9 + line);
        const lines = [];
        const crossMask = new Array(9).fill(0);
        for (let line = 0; line < 9; line++) {
          let m = 0;
          for (let cross = 0; cross < 9; cross++) {
            const c = cellAt(line, cross);
            if (!s.values[c] && s.cands[c] & bit) m |= 1 << cross;
          }
          crossMask[line] = m;
          if (POP[m] >= 2 && POP[m] <= n) lines.push(line);
        }
        const r = combos(lines, n, (group) => {
          const union = group.reduce((m, l) => m | crossMask[l], 0);
          if (POP[union] !== n) return null;
          const targets = [];
          for (let cross = 0; cross < 9; cross++) {
            if (!(union & (1 << cross))) continue;
            for (let line = 0; line < 9; line++) if (!group.includes(line)) targets.push([cellAt(line, cross), d]);
          }
          const baseCells = [];
          for (const l of group) for (let cross = 0; cross < 9; cross++) if (crossMask[l] & (1 << cross)) baseCells.push(cellAt(l, cross));
          return eliminate(s, targets, baseCells, [d], `${n === 2 ? "X-Wing" : "Swordfish"}：数字 ${d} 在${byRow ? "行" : "列"} ${group.map((l) => l + 1).join("、")} 中只出现在 ${n} 个${byRow ? "列" : "行"}，这些${byRow ? "列" : "行"}的其他格不能是 ${d}`);
        });
        if (r) return r;
      }
    }
    return null;
  }

  // ---------- 求解主流程 ----------
  function normalize(puzzle) {
    let flat = puzzle;
    if (Array.isArray(puzzle) && puzzle.length === 9 && Array.isArray(puzzle[0])) flat = puzzle.flat();
    if (!Array.isArray(flat) && !ArrayBuffer.isView(flat)) return null;
    if (flat.length !== 81) return null;
    for (const v of flat) if (!Number.isInteger(v) || v < 0 || v > 9) return null;
    return Array.from(flat);
  }

  function emptyResult(error) {
    return { solved: false, error, maxTier: 0, totalScore: 0, stepCount: 0, advancedStepCount: 0, techniqueUsage: {}, steps: [] };
  }

  // 分析题目：只用已实现的逻辑技巧求解。不修改传入的 puzzle。
  function analyzeSudoku(puzzle) {
    const values = normalize(puzzle);
    if (!values) return emptyResult("invalid_input");

    // 检查给定数字是否有重复
    for (let i = 0; i < 81; i++) {
      if (values[i] && PEERS[i].some((p) => values[p] === values[i])) return emptyResult("duplicate_given");
    }

    const cands = new Array(81).fill(0);
    for (let i = 0; i < 81; i++) {
      if (values[i]) continue;
      let used = 0;
      for (const p of PEERS[i]) if (values[p]) used |= 1 << values[p];
      cands[i] = ~used & 0x3fe;
    }
    const state = { values, cands };
    const result = emptyResult(null);
    let filled = values.filter(Boolean).length;

    const hasContradiction = () => {
      for (let i = 0; i < 81; i++) if (!values[i] && cands[i] === 0) return true;
      return false;
    };
    if (hasContradiction()) return Object.assign(result, { error: "contradiction" });

    while (filled < 81) {
      let found = null, tech = null;
      for (const t of TECHNIQUE_ORDER) {
        found = FINDERS[t](state);
        if (found) { tech = t; break; }
      }
      if (!found) break;

      const cfg = TECHNIQUE_CONFIG[tech];
      const step = {
        technique: tech, tier: cfg.tier, score: cfg.score, action: found.action,
        row: 0, col: 0, value: 0, eliminatedCandidates: [],
        cells: found.cells.map(rc), values: found.values, reason: found.reason,
      };
      if (found.action === "place") {
        values[found.cell] = found.value;
        cands[found.cell] = 0;
        for (const p of PEERS[found.cell]) cands[p] &= ~(1 << found.value);
        filled++;
        Object.assign(step, rc(found.cell), { value: found.value });
      } else {
        for (const [c, d] of found.elims) {
          cands[c] &= ~(1 << d);
          step.eliminatedCandidates.push({ row: rowOf(c), col: colOf(c), value: d });
        }
        Object.assign(step, step.eliminatedCandidates[0]);
      }
      result.steps.push(step);
      result.totalScore += cfg.score;
      result.maxTier = Math.max(result.maxTier, cfg.tier);
      result.stepCount++;
      if (cfg.tier >= 3) result.advancedStepCount++;
      result.techniqueUsage[tech] = (result.techniqueUsage[tech] || 0) + 1;

      if (hasContradiction()) { result.error = "contradiction"; return result; }
    }

    result.solved = filled === 81;
    if (!result.solved) result.error = "stuck";
    return result;
  }

  // 根据分析结果分级：返回 easy/medium/hard/expert，无法逻辑求解则返回 null
  function classifyDifficulty(analysis) {
    if (!analysis || !analysis.solved) return null;
    const t = DIFFICULTY_CONFIG.thresholds;
    if (analysis.maxTier >= 4) return "expert";
    if (analysis.maxTier === 3) return "hard";
    if (analysis.maxTier === 2) return analysis.totalScore > t.mediumMaxScore ? "hard" : "medium";
    return analysis.totalScore > t.easyMaxScore ? "medium" : "easy";
  }

  return { TECHNIQUE_CONFIG, DIFFICULTY_CONFIG, analyzeSudoku, classifyDifficulty };
})();
