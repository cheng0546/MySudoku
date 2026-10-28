// 求解器集中配置：技巧分级/分数、难度阈值与生成限制。其他模块通过 SolverKit 共享。
const SolverKit = {};
(() => {
  // 技巧配置：顺序即扫描顺序（从简单到复杂）。
  const TECHNIQUE_CONFIG = {
    naked_single:      { name: "唯一候选数", nameEn: "Naked Single",      tier: 1, score: 1 },
    hidden_single:     { name: "唯一位置",   nameEn: "Hidden Single",     tier: 1, score: 2 },
    locked_candidates: { name: "区块摒除",   nameEn: "Locked Candidates", tier: 2, score: 4 },
    naked_pair:        { name: "裸数对",     nameEn: "Naked Pair",        tier: 2, score: 4 },
    hidden_pair:       { name: "隐性数对",   nameEn: "Hidden Pair",       tier: 2, score: 5 },
    naked_triple:      { name: "裸三数组",   nameEn: "Naked Triple",      tier: 2, score: 8 },
    x_wing:            { name: "X-Wing",     nameEn: "X-Wing",            tier: 3, score: 12 },
    skyscraper:        { name: "摩天楼",     nameEn: "Skyscraper",        tier: 3, score: 13 },
    two_string_kite:   { name: "双线风筝",   nameEn: "Two-String Kite",   tier: 3, score: 13 },
    xy_wing:           { name: "XY-Wing",    nameEn: "XY-Wing",           tier: 3, score: 14 },
    finned_x_wing:     { name: "带鳍 X-Wing", nameEn: "Finned X-Wing",     tier: 3, score: 15 },
    unique_rectangle:  { name: "唯一矩形（类型1）", nameEn: "Unique Rectangle Type 1", tier: 3, score: 16 },
    xyz_wing:          { name: "XYZ-Wing",   nameEn: "XYZ-Wing",          tier: 4, score: 18 },
    swordfish:         { name: "Swordfish",  nameEn: "Swordfish",         tier: 4, score: 20 },
    x_chain:           { name: "X-Chain 单数链", nameEn: "X-Chain",        tier: 4, score: 21 },
    xy_chain:          { name: "XY-Chain",   nameEn: "XY-Chain",          tier: 4, score: 22 },
    jellyfish:         { name: "Jellyfish",  nameEn: "Jellyfish",         tier: 4, score: 25 },
    x_cycle:           { name: "X-Cycle 连续环", nameEn: "X-Cycle",       tier: 4, score: 23 },
    sue_de_coq:        { name: "Sue de Coq", nameEn: "Sue de Coq",        tier: 4, score: 27 },
    als_xz:            { name: "ALS-XZ",     nameEn: "ALS-XZ",            tier: 4, score: 28 },
    als_chain:         { name: "ALS 链",     nameEn: "ALS Chain",         tier: 4, score: 30 },
    aic:               { name: "交替推理链 AIC", nameEn: "Alternating Inference Chain", tier: 4, score: 26 },
    grouped_aic:       { name: "分组链 Grouped AIC", nameEn: "Grouped AIC", tier: 4, score: 29 },
    forcing_chain:     { name: "强制链 Forcing Chain", nameEn: "Forcing Chain", tier: 4, score: 32 },
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

  // 链式推理引擎的最大链长（节点数，即候选数个数）。链越长扫描越慢。
  const CHAIN_MAX_NODES = 12;

  const TECHNIQUE_ORDER = Object.keys(TECHNIQUE_CONFIG);
  Object.assign(SolverKit, { TECHNIQUE_CONFIG, DIFFICULTY_CONFIG, CHAIN_MAX_NODES, TECHNIQUE_ORDER });
})();
