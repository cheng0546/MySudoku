// 求解主流程、难度评估与技巧汇总。对外暴露 SudokuSolver。
const SudokuSolver = (() => {
  const { PEERS, rc, rowOf, colOf, TECHNIQUE_CONFIG, TECHNIQUE_HELP, DIFFICULTY_CONFIG, TECHNIQUE_ORDER, FINDERS } = SolverKit;
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
    return { solved: false, error, maxTier: 0, totalScore: 0, stepCount: 0, advancedStepCount: 0, maxChainLength: 0, hardestTechnique: null, techniqueUsage: {}, steps: [] };
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
      if (found.chain) step.chain = found.chain.map((n) => ({ cells: n.cells.map(rc), value: n.value }));
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
      if (step.chain) result.maxChainLength = Math.max(result.maxChainLength, step.chain.length);
      if (!result.hardestTechnique || cfg.score > TECHNIQUE_CONFIG[result.hardestTechnique].score) result.hardestTechnique = tech;
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

  // 技巧汇总（教学与结算页共用）：按等级、分数排序，包含使用次数、占总分比例和最难标记
  function summarizeTechniques(analysis) {
    if (!analysis || !analysis.techniqueUsage) return [];
    return Object.keys(analysis.techniqueUsage)
      .map((key) => {
        const cfg = TECHNIQUE_CONFIG[key], count = analysis.techniqueUsage[key];
        return { key, name: cfg.name, nameEn: cfg.nameEn, tier: cfg.tier, score: cfg.score, count, points: cfg.score * count, hardest: key === analysis.hardestTechnique };
      })
      .sort((a, b) => b.tier - a.tier || b.score - a.score);
  }

  return { TECHNIQUE_CONFIG, TECHNIQUE_HELP, DIFFICULTY_CONFIG, analyzeSudoku, classifyDifficulty, summarizeTechniques };
})();
