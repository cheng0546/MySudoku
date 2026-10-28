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

  // 技巧教学文本（展示用，可后续做多语言）
  const TECHNIQUE_HELP = {
    naked_single: {
      summary: "某个格子的候选数只剩一个，那它就只能填这个数。",
      how: "先把同行、同列、同宫已出现的数字从该格的候选中划掉。如果只剩下一个数字，直接填入。",
      example: "某格所在的行、列、宫里已经有 1、2、3、4、5、6、7、8，那么这格只能是 9。",
    },
    hidden_single: {
      summary: "某个数字在一行/一列/一宫里只有一个格子能放，它就必须放在那里。",
      how: "任选一个单元（行、列或宫），看某个数字还能放在哪些格子里。如果只剩一个格子，即使这格还有别的候选数，也必须填这个数字。",
      example: "第 5 行中，数字 7 只有第 3 列这一格可以填，那么该格就是 7。",
    },
    locked_candidates: {
      summary: "一个数字在某宫内的候选位置都落在同一行（或列）时，该行（或列）在宫外的格子都不能是这个数字。反过来也成立。",
      how: "（指向）宫内数字 X 的候选都在同一行 → 这一行宫外的格子划掉 X。（宣告）行/列内数字 X 的候选都在同一个宫 → 该宫内行/列之外的格子划掉 X。",
      example: "第 1 宫里数字 4 只能放在第 2 行，那么第 2 行其他两个宫里的格子都不能是 4。",
    },
    naked_pair: {
      summary: "同一单元内有两个格子，候选数都是同样的两个数字，这两个数字就只属于这两格，单元内其他格子要排除它们。",
      how: "在一行/列/宫中找两个候选数完全相同的双候选格（如都是 {2,5}）。同一单元内其他格子的候选里把 2 和 5 划掉。",
      example: "某行有两格都是 {2,5}，则这一行其余格子都不能填 2 或 5。",
    },
    hidden_pair: {
      summary: "一个单元里有两个数字，只能出现在同样的两个格子里，这两个格子就只能放这两个数字，其他候选可以划掉。",
      how: "统计单元内每个数字的可放位置。如果数字 A、B 都只出现在同样的两格，就把这两格里除 A、B 以外的候选数全部划掉。",
      example: "某宫中 3 和 8 只出现在左上两格，则这两格里的其他候选数都可以排除。",
    },
    naked_triple: {
      summary: "同一单元内有三个格子，它们的候选数合起来只有三个数字，这三个数字就只属于这三格，单元内其他格子要排除它们。",
      how: "找三个格子，候选数的并集恰好是三个数字（每格可以只含其中两个）。同一单元内其他格子划掉这三个数字。",
      example: "某列三格的候选分别是 {1,4}、{4,7}、{1,7}，则该列其他格子都不能填 1、4、7。",
    },
    x_wing: {
      summary: "某数字在两行中都恰好只有两个候选位置，且位于相同的两列，形成矩形。这两列中其他格子不能是该数字（行列互换同理）。",
      how: "找数字 X：在两行里都只能放在同样的两列。X 在这两行里必然占据矩形的一组对角，所以这两列的其他格子都可以划掉 X。",
      example: "数字 6 在第 2 行只能放第 3、7 列，在第 8 行也只能放第 3、7 列，则第 3、7 列的其他格子都不能是 6。",
    },
    xy_wing: {
      summary: "一个双候选枢纽格 {X,Y}，两个双候选翼格 {X,Z} 和 {Y,Z} 都能看到枢纽。无论枢纽是什么，Z 都会出现在某个翼格，所以同时能看到两个翼格的格子不能是 Z。",
      how: "1) 找枢纽 {X,Y}。2) 在它同行/列/宫内找翼 {X,Z} 与 {Y,Z}。3) 同时被两个翼看到的格子划掉 Z。",
      example: "枢纽 {1,2}，翼 {1,5} 和 {2,5}：枢纽若是 1，则翼 {1,5} 不能是 1，只能是 5；枢纽若是 2，则翼 {2,5} 只能是 5。两种情况下都有一个翼是 5，所以同时看到两翼的格子不能是 5。",
    },
    skyscraper: {
      summary: "某数字在两行（或两列）里各只有两个候选位置，且其中一处在同一列上，另一处（屋顶）不同。两个屋顶格至少有一个是该数字，同时看到两个屋顶的格子不能是该数字。",
      how: "1) 找两行，某数字在每行都恰好只有 2 个位置。2) 两行里各有一个位置同列（底部）。3) 另外两个位置是“屋顶”，同时看到两个屋顶的格子划掉该数字。",
      example: "数字 5 在第 2 行只能放 C3、C8，在第 7 行只能放 C3、C6，底部同在第 3 列。屋顶是 R2C8 和 R7C6，两者至少有一个是 5。",
    },
    two_string_kite: {
      summary: "某数字在一行里只有两个位置，在一列里也只有两个位置，且行上一格与列上一格同宫。风筝的另两端至少有一个是该数字，同时看到两端的格子不能是该数字。",
      how: "1) 找某数字在一行中恰好 2 个位置，在一列中也恰好 2 个位置。2) 行和列上各取一格，使它们在同一个宫（风筝的“结”）。3) 剩下的两端同时看到的格子划掉该数字。",
      example: "数字 7 在第 3 行只有 C2、C8，在第 3 列只有 R1、R8；R3C2 与 R1C3 同在第 1 宫。R3C8 与 R8C3 至少一个是 7，同时看到两者的 R8C8 不能是 7。",
    },
    finned_x_wing: {
      summary: "像 X-Wing，但其中一行（列）在矩形的两个位置之外，多了几个同宫的“鳍”。鳍为真时，鳍所在宫内被它看到的格子要排除；鳍为假时就是标准 X-Wing。两种情况都成立的排除就是结论。",
      how: "1) 找一行只有 2 个位置（基线 A），另一行包含这两个位置并多出鳍（基线 B）。2) 所有鳍必须在同一个宫，且该宫包含基线 B 上的一个矩形角。3) 在这个宫内、矩形该列上、基线以外的格子划掉该数字。",
      example: "数字 4 在第 1 行只有 C2、C7；第 4 行有 C2、C7 和鳍 R4C3（与 R4C2 同宫）。则 R5C2、R6C2 不能是 4。",
    },
    unique_rectangle: {
      summary: "矩形四格跨两个宫，其中三格都是同一对候选 {a,b}。如果第四格也取 a 或 b，这个矩形就会出现两种互换的填法，违反“唯一解”，所以第四格要划掉 a、b。",
      how: "1) 找 4 个格子组成矩形，且恰好跨两个宫。2) 三格的候选数完全相同，都是 {a,b}。3) 第四格含 a、b 和其他候选数，把 a、b 划掉。",
      example: "例：R1C1、R1C4、R2C1 都是 {3,7}，R2C4 是 {3,7,9}，则 R2C4 只能是 9。注意：这个技巧依赖“题目只有唯一解”这一前提，本网站的题目都已验证唯一解。",
    },
    jellyfish: {
      summary: "Swordfish 的四行（列）版本：某数字在四行里的候选位置合起来只占四列，这四列的其他格子不能是该数字。",
      how: "找数字 X：四行中每行的候选位置都落在同样的四列内（每行 2～4 个）。X 在这四行里必然占满这四列，所以这四列的其他格子划掉 X。",
      example: "数字 2 在第 1、3、6、8 行的候选都落在第 2、4、7、9 列内，则这四列在其他行的格子都不能是 2。",
    },
    xyz_wing: {
      summary: "枢纽格有三个候选 {X,Y,Z}，两个双候选翼格 {X,Z}、{Y,Z} 都能看到枢纽。无论枢纽取什么，Z 都落在这三格之一，所以同时看到三格的格子不能是 Z。",
      how: "1) 找三候选枢纽 {X,Y,Z}。2) 找翼 {X,Z} 和 {Y,Z}，都在枢纽的同一单元内。3) 同时能看到枢纽和两个翼的格子划掉 Z。",
      example: "枢纽 {1,2,5}，翼 {1,5}、{2,5}：这三格中一定有一个是 5，所以同时看到它们的格子不能是 5。",
    },
    swordfish: {
      summary: "X-Wing 的三行（列）版本：某数字在三行里的候选位置，合起来只占三列。这三列的其他格子不能是该数字。",
      how: "找数字 X：三行中每行的候选位置都限制在同样的三列内（每行可以有 2～3 个）。X 在这三行里必然占满这三列，所以这三列的其他格子划掉 X。",
      example: "数字 4 在第 1、5、8 行的候选都落在第 2、6、9 列内，则这三列在其他行的格子都不能是 4。",
    },
    xy_chain: {
      summary: "由多个双候选格首尾相连组成一条链，相邻两格共享一个数字。链的两端中至少有一端是数字 A，所以同时能看到两端的格子不能是 A。",
      how: "从双候选格 {A,B} 出发，找能看到它且含 B 的双候选格 {B,C}，再继续 {C,D}……直到链末端出现 A。如果起点不是 A，推下去末端必为 A，所以两端至少有一个是 A，同时看到两端的格子划掉 A。",
      example: "链 {1,2} → {2,3} → {3,1}：两端至少有一个是 1，同时看到两端的格子不能是 1。",
    },
    x_chain: {
      summary: "只盯着一个数字，用“强链”（某单元里该数字只剩两个位置）和“弱链”（同单元的两个位置）交替连成一条链。链的两端至少有一个是该数字，同时看到两端的格子可以划掉它。",
      how: "选数字 X，找出各行、列、宫里 X 恰好只有两个位置的强链，用同单元的弱链把它们首尾相接，形成 强-弱-强-弱-强 的链（长度为奇数个链接）。若左端不是 X，则强链推出下一格是 X，弱链使再下一格不是 X……最终右端必为 X。因此两端至少一个是 X。",
      example: "数字 5：R1C2=R1C8 – R5C8=R5C4 – R8C4=R8C1，两端 R1C2、R8C1 至少一个是 5，能同时看到两端的 R2C1、R9C2 不能是 5。",
    },
    aic: {
      summary: "交替推理链（AIC）：在候选数关系图上，用强链和弱链交替连接，不限数字、不限格子。链两端至少有一个为真，同时与两端有弱链的候选数可排除。",
      how: "强链：两个候选数必有一个为真（双候选格里的两个数，或单元里只剩两个位置的数字）。弱链：两个候选数最多一个为真（同格不同数，或同单元同数字）。从某候选数开始“强-弱-强……”交替延伸，末端同样是强链。X-Chain 和 XY-Chain 都是 AIC 的特例。",
      example: "R1C1(3)=R1C1(7) – R1C5(7)=R6C5(7) – R6C5(3)=R6C9(3)：两端都是数字 3，至少一个为真，所以 R1C9 的 3 可排除。",
    },
    x_cycle: {
      summary: "单一数字的强弱链首尾相接成一个闭合的环。环上每条弱链都等价于强链，所以同时看到弱链两端的格子不能是该数字。",
      how: "选数字 X，找一条强-弱-强-弱……的链，最后一条弱链把链尾接回链头（环上节点数为偶数）。环只有两种填法：奇数位全是 X，或偶数位全是 X。无论哪种，每对相邻节点恰有一个是 X，所以能同时看到相邻两节点的其他格子划掉 X。",
      example: "数字 7 在四个格组成强弱交替的环，环外同时看到某相邻两格的格子不能是 7。",
    },
    grouped_aic: {
      summary: "AIC 的升级版：链上的节点可以是“同一行/列与同一宫交叉区内的几个格”（分组节点），表示该数字在这几格之一。",
      how: "例如数字 4 在某宫只剩同一行的两个格，这两格合起来当作一个节点。单元内候选位置被切成恰好两部分时，两部分构成强链；与分组节点所有格都互相看到的格子构成弱链。其余推理与 AIC 完全相同。",
      example: "宫 1 里 4 只剩 R1C1、R1C2（分组节点）；第 1 行其余位置的 4 与该分组构成弱链，从而把本来无法连接的强链连起来。",
    },
    als_xz: {
      summary: "ALS（几乎锁定集）是同一单元里 n 个格、共 n+1 个候选数的格子集合。两个 ALS 通过“限制数字”X 关联，可以排除它们共有的另一个数字 Z。",
      how: "找两个互不重叠的 ALS：A、B。若两者都含 X，且 A 中所有含 X 的格与 B 中所有含 X 的格两两互相看到（X 是限制数字），那么 A、B 至多一边含 X。另一边失去 X 后变成 n 格装 n 个数字，必然含有另一个共有数字 Z。因此同时看到 A、B 中所有 Z 的格子不能是 Z。",
      example: "A={R1C1(1,2)}（双候选格），B={R1C5,R1C8(1,3,4 共三个数两个格)}，X=1 是限制数字，共有数字 Z=2 或 3 可被排除。",
    },
    als_chain: {
      summary: "把 3～4 个 ALS 首尾相接成链，相邻两个靠各自的限制数字连接。链两端若含同一数字 Z，就能排除同时看到两端所有 Z 的格子。",
      how: "ALS-XZ 是两个 ALS 的情形。把它延长：A –x1– B –x2– C，其中 x1≠x2。若 A 不含 Z，则 A 变成锁定集，把 x1 逼到 B 之外，B 变成锁定集，把 x2 逼到 C 之外……最终 C 必含 Z。所以 A、C 至少一个含 Z（Z 不能是两端的限制数字）。",
      example: "A、B、C 三个 ALS 依次靠限制数字 1、2 相连，A 与 C 都含 3，则同时看到两者所有 3 的格子不能是 3。",
    },
    sue_de_coq: {
      summary: "行（列）与宫的交叉区 2～3 个格拥有多于格数的候选数。再从该行（列）和该宫的其余格各找一组，把交叉区的数字“分摊”后，可排除很多候选数。",
      how: "设交叉区 I（候选数并集 V）。在行内交叉区之外找格子组 A，在宫内交叉区之外找格子组 C，A、C 的候选数都属于 V 且互不相同，并且 I、A、C 的格子总数等于 V 的数字个数。于是这些格恰好装下 V 的所有数字：A 的数字只能在 I 或 A，C 的数字只能在 I 或 C，其余数字只能在 I。对应的单元其他格可划掉这些数字。",
      example: "交叉区 R1C1、R1C2 含 {1,2,3,4}，A={R1C5(1,2)}，C={R2C1(3,4)}：4 个格装 1234，则第 1 行其他格不能是 1、2。",
    },
    forcing_chain: {
      summary: "做出假设，沿着“唯一候选数、唯一位置”一路推下去。若各种假设都得到同一个结论，或其他假设都导致矛盾，这个结论就一定成立。",
      how: "选一个“必有一个成立”的集合：双候选格的两个数，或某单元里某数字仅剩 2～3 个位置。逐个假设，用唯一候选数和唯一位置推导。假设导致矛盾就排除；剩下的假设如果得出同一个格子的同一个数，或同一个候选数都被排除，就可以直接采用。",
      example: "R1C1 是 {3,5}：假设 3 时 R4C7 被推为 8；假设 5 时 R4C7 也被推为 8，所以 R4C7 就是 8。",
    },
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
    const seenPair = new Set();
    const elims = pairs.filter(([c, d]) => {
      const k = c * 10 + d;
      if (seenPair.has(k) || !(s.cands[c] & (1 << d))) return false;
      seenPair.add(k);
      return true;
    });
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
    jellyfish: (s) => fish(s, 4),
    skyscraper: (s) => skyscraper(s),
    two_string_kite: (s) => twoStringKite(s),
    finned_x_wing: (s) => finnedXWing(s),
    unique_rectangle: (s) => uniqueRectangle(s),

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

    // 链式推理（候选数关系图上的交替推理链）：三种过滤模式共用同一个引擎 chainSearch
    xy_chain: (s) => chainSearch(s, "xy"),
    x_chain: (s) => chainSearch(s, "x"),
    aic: (s) => chainSearch(s, "aic"),
    x_cycle: (s) => chainSearch(s, "xcycle"),
    grouped_aic: groupedSearch,
    als_xz: alsXZ,
    als_chain: alsChain,
    sue_de_coq: sueDeCoq,
    forcing_chain: forcingChain,
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
          return eliminate(s, targets, baseCells, [d], `${FISH_NAMES[n]}：数字 ${d} 在${byRow ? "行" : "列"} ${group.map((l) => l + 1).join("、")} 中只出现在 ${n} 个${byRow ? "列" : "行"}，这些${byRow ? "列" : "行"}的其他格不能是 ${d}`);
        });
        if (r) return r;
      }
    }
    return null;
  }

  const FISH_NAMES = { 2: "X-Wing", 3: "Swordfish", 4: "Jellyfish" };

  // 某数字在各行（byRow）或各列中的候选位置掩码（bit = 交叉方向的下标）
  function lineMasks(s, d, byRow) {
    const bit = 1 << d;
    const masks = new Array(9).fill(0);
    for (let line = 0; line < 9; line++) {
      for (let cross = 0; cross < 9; cross++) {
        const c = byRow ? line * 9 + cross : cross * 9 + line;
        if (!s.values[c] && s.cands[c] & bit) masks[line] |= 1 << cross;
      }
    }
    return masks;
  }
  const lineCell = (byRow, line, cross) => (byRow ? line * 9 + cross : cross * 9 + line);
  const crossesOf = (mask) => [...Array(9).keys()].filter((i) => mask & (1 << i));
  const cellHas = (s, c, d) => !s.values[c] && (s.cands[c] & (1 << d)) !== 0;

  // 摩天楼：两条线（行/列）都只有两个候选位置，且其中一端在同一交叉线上，
  // 另一端（屋顶）不同。两个屋顶格至少一个为真，同时看到两者的格子排除该数。
  function skyscraper(s) {
    for (let d = 1; d <= 9; d++) {
      for (const byRow of [true, false]) {
        const masks = lineMasks(s, d, byRow);
        const pairs = [];
        for (let l = 0; l < 9; l++) if (POP[masks[l]] === 2) pairs.push(l);
        const r = combos(pairs, 2, ([l1, l2]) => {
          const shared = masks[l1] & masks[l2];
          if (POP[shared] !== 1) return null;
          const e1 = crossesOf(masks[l1] & ~shared)[0], e2 = crossesOf(masks[l2] & ~shared)[0];
          const x = crossesOf(shared)[0];
          const E1 = lineCell(byRow, l1, e1), E2 = lineCell(byRow, l2, e2);
          const base = [lineCell(byRow, l1, x), lineCell(byRow, l2, x)];
          const targets = [];
          for (let c = 0; c < 81; c++) if (c !== E1 && c !== E2 && !base.includes(c) && SEES[c][E1] && SEES[c][E2]) targets.push([c, d]);
          return eliminate(s, targets, [...base, E1, E2], [d],
            `摩天楼：数字 ${d} 在${unitName(byRow ? l1 : 9 + l1)}、${unitName(byRow ? l2 : 9 + l2)}各只有两处，底部 ${rcText(base[0])}、${rcText(base[1])} 互相看到，屋顶 ${rcText(E1)}、${rcText(E2)} 至少一个是 ${d}，同时看到两个屋顶的格子不能是 ${d}`);
        });
        if (r) return r;
      }
    }
    return null;
  }

  // 双线风筝：一行与一列各只有两个候选位置，两线上各有一格同宫（风筝的“结”），
  // 另两端至少一个为真，同时看到两端的格子排除该数。
  function twoStringKite(s) {
    for (let d = 1; d <= 9; d++) {
      const rowM = lineMasks(s, d, true), colM = lineMasks(s, d, false);
      for (let r = 0; r < 9; r++) {
        if (POP[rowM[r]] !== 2) continue;
        const rowCells = crossesOf(rowM[r]).map((c) => r * 9 + c);
        for (let c = 0; c < 9; c++) {
          if (POP[colM[c]] !== 2) continue;
          const colCells = crossesOf(colM[c]).map((rr) => rr * 9 + c);
          for (const a1 of rowCells) for (const b1 of colCells) {
            if (a1 === b1 || boxOf(a1) !== boxOf(b1)) continue;
            const a2 = rowCells.find((x) => x !== a1), b2 = colCells.find((x) => x !== b1);
            if (a2 === b2 || a2 === b1 || b2 === a1) continue;
            const targets = [];
            for (let t = 0; t < 81; t++) if (![a1, a2, b1, b2].includes(t) && SEES[t][a2] && SEES[t][b2]) targets.push([t, d]);
            const res = eliminate(s, targets, [a1, a2, b1, b2], [d],
              `双线风筝：数字 ${d} 在第${r + 1}行只有 ${rcText(a1)}、${rcText(a2)}，在第${c + 1}列只有 ${rcText(b1)}、${rcText(b2)}，${rcText(a1)} 与 ${rcText(b1)} 同宫，故 ${rcText(a2)}、${rcText(b2)} 至少一个是 ${d}，同时看到两者的格子不能是 ${d}`);
            if (res) return res;
          }
        }
      }
    }
    return null;
  }

  // 带鳍 X-Wing：一条基线恰有两个位置，另一条基线在这两处之外还有“鳍”（均在同一宫）。
  // 鳍为真时，宫内看到鳍的格子排除；鳍为假时即为普通 X-Wing，覆盖线上的格子排除。
  function finnedXWing(s) {
    for (let d = 1; d <= 9; d++) {
      for (const byRow of [true, false]) {
        const masks = lineMasks(s, d, byRow);
        for (let l1 = 0; l1 < 9; l1++) {
          if (POP[masks[l1]] !== 2) continue;
          for (let l2 = 0; l2 < 9; l2++) {
            if (l2 === l1 || (masks[l2] & masks[l1]) !== masks[l1]) continue;
            const finMask = masks[l2] & ~masks[l1];
            if (!finMask) continue;
            const fins = crossesOf(finMask).map((x) => lineCell(byRow, l2, x));
            const box = boxOf(fins[0]);
            if (fins.some((f) => boxOf(f) !== box)) continue;
            for (const k of crossesOf(masks[l1])) {
              if (boxOf(lineCell(byRow, l2, k)) !== box) continue;
              const targets = [];
              for (let line = 0; line < 9; line++) {
                if (line === l1 || line === l2) continue;
                const c = lineCell(byRow, line, k);
                if (boxOf(c) === box) targets.push([c, d]);
              }
              const base = [...crossesOf(masks[l1]).map((x) => lineCell(byRow, l1, x)), ...crossesOf(masks[l2] & masks[l1]).map((x) => lineCell(byRow, l2, x))];
              const res = eliminate(s, targets, [...base, ...fins], [d],
                `带鳍 X-Wing：数字 ${d} 在${unitName(byRow ? l1 : 9 + l1)}只有两处，${unitName(byRow ? l2 : 9 + l2)}在同样两处之外多出鳍 ${fins.map(rcText).join("、")}。鳍为真或为假都能推出：与鳍同宫且在${byRow ? "第" + (k + 1) + "列" : "第" + (k + 1) + "行"}的格子不能是 ${d}`);
              if (res) return res;
            }
          }
        }
      }
    }
    return null;
  }

  // 唯一矩形（类型1）：矩形四格跨两个宫，其中三格都是同一对候选 {a,b}，
  // 第四格含 a、b 及其他候选。若第四格填 a 或 b 就会出现两种填法（违反唯一解），故排除 a、b。
  function uniqueRectangle(s) {
    for (let r1 = 0; r1 < 9; r1++) for (let r2 = r1 + 1; r2 < 9; r2++) {
      for (let c1 = 0; c1 < 9; c1++) for (let c2 = c1 + 1; c2 < 9; c2++) {
        const cs = [r1 * 9 + c1, r1 * 9 + c2, r2 * 9 + c1, r2 * 9 + c2];
        if (cs.some((c) => s.values[c])) continue;
        if (new Set(cs.map(boxOf)).size !== 2) continue;
        for (const odd of cs) {
          const others = cs.filter((c) => c !== odd);
          const pair = s.cands[others[0]];
          if (POP[pair] !== 2 || others.some((c) => s.cands[c] !== pair)) continue;
          if ((s.cands[odd] & pair) !== pair || s.cands[odd] === pair) continue;
          const [a, b] = digitsOf(pair);
          const res = eliminate(s, [[odd, a], [odd, b]], cs, [a, b],
            `唯一矩形：${cs.map(rcText).join("、")} 构成矩形，其中三格都是 {${a},${b}}。若 ${rcText(odd)} 也取 ${a} 或 ${b}，矩形就有两种填法，与唯一解矛盾，故 ${rcText(odd)} 不能是 ${a}、${b}`);
          if (res) return res;
        }
      }
    }
    return null;
  }

  // ---------- 链式推理引擎 ----------
  // 候选数关系图：节点 = 某格的某个候选数（n = 格*9 + 数字-1）。
  //  强链：两个候选数“恰有一个为真”（双候选格内两数；单元内某数字恰好两个位置）。
  //  弱链：两个候选数“最多一个为真”（同格不同数；同单元同数字）。
  // 交替推理链 AIC：n0 =强= n1 -弱- n2 =强= n3 ... =强= nk。
  // 若 n0 为假则沿链推出 nk 为真，所以 n0、nk 至少一个为真；
  // 与两端都有弱链的候选数不可能为真，可以排除。
  // 模式：xy 只用双候选格的强链（XY-Chain）；x 只用单一数字的单元强链（X-Chain）；aic 不限制。
  const nodeCell = (n) => (n / 9) | 0;
  const nodeDigit = (n) => (n % 9) + 1;
  const nodeText = (n) => `${rcText(nodeCell(n))}(${nodeDigit(n)})`;
  const isWeak = (a, b) => {
    if (a === b) return false;
    const ca = nodeCell(a), cb = nodeCell(b);
    return ca === cb || (nodeDigit(a) === nodeDigit(b) && SEES[ca][cb]);
  };

  function chainSearch(s, mode) {
    const has = (n) => !s.values[nodeCell(n)] && (s.cands[nodeCell(n)] & (1 << nodeDigit(n))) !== 0;
    const strong = Array.from({ length: 729 }, () => []);
    const useCell = mode !== "x" && mode !== "xcycle", useUnit = mode !== "xy";
    if (useCell) {
      for (let c = 0; c < 81; c++) {
        if (s.values[c] || POP[s.cands[c]] !== 2) continue;
        const [d1, d2] = digitsOf(s.cands[c]);
        strong[c * 9 + d1 - 1].push(c * 9 + d2 - 1);
        strong[c * 9 + d2 - 1].push(c * 9 + d1 - 1);
      }
    }
    if (useUnit) {
      for (let u = 0; u < 27; u++) {
        for (let d = 1; d <= 9; d++) {
          const pos = UNITS[u].filter((c) => cellHas(s, c, d));
          if (pos.length !== 2) continue;
          const a = pos[0] * 9 + d - 1, b = pos[1] * 9 + d - 1;
          if (!strong[a].includes(b)) { strong[a].push(b); strong[b].push(a); }
        }
      }
    }
    const weakNbrs = (n) => {
      const out = [], c = nodeCell(n), d = nodeDigit(n);
      if (mode === "aic") for (let e = 1; e <= 9; e++) if (e !== d && cellHas(s, c, e)) out.push(c * 9 + e - 1);
      for (const p of PEERS[c]) if (cellHas(s, p, d)) out.push(p * 9 + d - 1);
      return out;
    };

    const visited = new Int32Array(729 * 2);
    const parent = new Int32Array(729 * 2);
    let stamp = 0;
    for (let n0 = 0; n0 < 729; n0++) {
      if (!has(n0) || !strong[n0].length) continue;
      stamp++;
      // 状态：node*2+0 = 刚经过弱链/起点（下一步走强链）；node*2+1 = 刚经过强链（下一步走弱链）
      let frontier = [n0 * 2];
      visited[n0 * 2] = stamp;
      parent[n0 * 2] = -1;
      for (let depth = 1; depth < CHAIN_MAX_NODES && frontier.length; depth++) {
        const next = [];
        for (const st of frontier) {
          const n = st >> 1;
          const nbrs = st & 1 ? weakNbrs(n) : strong[n];
          const ns = st & 1 ? 0 : 1;
          for (const m of nbrs) {
            const key = m * 2 + ns;
            if (visited[key] === stamp) continue;
            visited[key] = stamp;
            parent[key] = st;
            next.push(key);
            if (ns !== 1 || m === n0 || depth < 3) continue;
            const path = [];
            for (let k = key; k !== -1; k = parent[k]) path.push(k >> 1);
            path.reverse();
            if (new Set(path).size !== path.length) continue;
            if (mode === "xcycle") {
              // 连续环：链尾与链头再用弱链闭合，环上每条弱链都等价于强链（两端恰有一个为真）
              if (!isWeak(m, n0)) continue;
              const d = nodeDigit(n0), inLoop = new Set(path.map(nodeCell));
              const pairs = [];
              for (let i = 1; i < path.length; i += 2) pairs.push([path[i], path[(i + 1) % path.length]]);
              const loopTargets = [];
              for (const [a, b] of pairs) {
                for (let c = 0; c < 81; c++) {
                  if (!inLoop.has(c) && cellHas(s, c, d) && SEES[c][nodeCell(a)] && SEES[c][nodeCell(b)]) loopTargets.push([c, d]);
                }
              }
              const loopText = path.map((x, i) => (i ? (i % 2 ? " = " : " – ") : "") + nodeText(x)).join("") + ` – ${nodeText(n0)}`;
              const lr = eliminate(s, loopTargets, [...inLoop], [d],
                `X-Cycle 连续环：${loopText}。环上强弱链交替，每条弱链都等价于强链（两端恰有一个是 ${d}），因此同时看到某条弱链两端的格子不能是 ${d}`);
              if (lr) return Object.assign(lr, { chain: path.map((n) => ({ cells: [nodeCell(n)], value: nodeDigit(n) })) });
              continue;
            }
            const targets = [];
            for (const c of weakNbrs(n0)) if (c !== m && isWeak(m, c)) targets.push([nodeCell(c), nodeDigit(c)]);
            if (!targets.length) continue;
            const cells = [...new Set(path.map(nodeCell))];
            const values = [...new Set(path.map(nodeDigit))];
            const chainText = path.map((x, i) => (i ? (i % 2 ? " = " : " – ") : "") + nodeText(x)).join("");
            const label = { xy: "XY-Chain", x: "X-Chain", aic: "AIC" }[mode];
            const r = eliminate(s, targets, cells, values,
              `${label}：${chainText}（= 强链，– 弱链）。若 ${nodeText(n0)} 为假则链末端 ${nodeText(m)} 为真，所以两端至少一个为真，与两端都有弱链的候选数可排除`);
            if (r) return Object.assign(r, { chain: path.map((n) => ({ cells: [nodeCell(n)], value: nodeDigit(n) })) });
          }
        }
        frontier = next;
      }
    }
    return null;
  }

  // ---------- 分组链（Grouped AIC） ----------
  // 节点可以是“某数字在同一单元交叉区内的若干格”（分组节点，含义：该数字在这几格之一）。
  // 强链：单元内该数字的候选位置恰好分成两部分（按宫/行/列切分），两部分必有一个为真。
  // 弱链：同数字且两节点不相交、且互相能看到对方每一格；或同格不同数字。
  function groupedSearch(s) {
    const nodes = [], keyMap = new Map(), strong = [];
    const getNode = (d, cells) => {
      const key = d + ":" + cells.join(",");
      if (!keyMap.has(key)) {
        keyMap.set(key, nodes.length);
        nodes.push({ d, cells });
        strong.push([]);
      }
      return keyMap.get(key);
    };
    const seen = new Set();
    const link = (a, b) => {
      const k = a < b ? a + "," + b : b + "," + a;
      if (seen.has(k)) return;
      seen.add(k);
      strong[a].push(b);
      strong[b].push(a);
    };
    for (let c = 0; c < 81; c++) {
      if (s.values[c]) continue;
      for (const d of digitsOf(s.cands[c])) getNode(d, [c]);
      if (POP[s.cands[c]] === 2) {
        const [d1, d2] = digitsOf(s.cands[c]);
        link(getNode(d1, [c]), getNode(d2, [c]));
      }
    }
    const partition = (pos, keyFn) => {
      const m = new Map();
      for (const c of pos) {
        const k = keyFn(c);
        if (!m.has(k)) m.set(k, []);
        m.get(k).push(c);
      }
      return [...m.values()];
    };
    for (let u = 0; u < 27; u++) {
      for (let d = 1; d <= 9; d++) {
        const pos = UNITS[u].filter((c) => cellHas(s, c, d));
        if (pos.length < 2) continue;
        if (pos.length === 2) link(getNode(d, [pos[0]]), getNode(d, [pos[1]]));
        const schemes = u < 18 ? [boxOf] : [rowOf, colOf];
        for (const f of schemes) {
          const parts = partition(pos, f);
          if (parts.length === 2) link(getNode(d, parts[0]), getNode(d, parts[1]));
        }
      }
    }
    const byDigit = Array.from({ length: 10 }, () => []);
    nodes.forEach((nd, i) => byDigit[nd.d].push(i));
    const weakBetween = (A, B) => {
      if (A.d !== B.d) return A.cells.length === 1 && B.cells.length === 1 && A.cells[0] === B.cells[0];
      for (const a of A.cells) for (const b of B.cells) if (a === b || !SEES[a][b]) return false;
      return true;
    };
    const weakCache = new Map();
    const weakNbrs = (n) => {
      if (weakCache.has(n)) return weakCache.get(n);
      const A = nodes[n], out = [];
      for (const j of byDigit[A.d]) if (j !== n && weakBetween(A, nodes[j])) out.push(j);
      if (A.cells.length === 1) {
        for (const e of digitsOf(s.cands[A.cells[0]])) if (e !== A.d) out.push(keyMap.get(e + ":" + A.cells[0]));
      }
      weakCache.set(n, out);
      return out;
    };
    const nText = (n) => `${nodes[n].cells.map(rcText).join("/")}(${nodes[n].d})`;

    const N = nodes.length;
    const visited = new Int32Array(N * 2), parent = new Int32Array(N * 2);
    let stamp = 0;
    for (let n0 = 0; n0 < N; n0++) {
      if (!strong[n0].length) continue;
      stamp++;
      let frontier = [n0 * 2];
      visited[n0 * 2] = stamp;
      parent[n0 * 2] = -1;
      for (let depth = 1; depth < CHAIN_MAX_NODES && frontier.length; depth++) {
        const next = [];
        for (const st of frontier) {
          const n = st >> 1;
          const nbrs = st & 1 ? weakNbrs(n) : strong[n];
          const ns = st & 1 ? 0 : 1;
          for (const m of nbrs) {
            const key = m * 2 + ns;
            if (visited[key] === stamp) continue;
            visited[key] = stamp;
            parent[key] = st;
            next.push(key);
            if (ns !== 1 || m === n0 || depth < 3) continue;
            const path = [];
            for (let k = key; k !== -1; k = parent[k]) path.push(k >> 1);
            path.reverse();
            if (new Set(path).size !== path.length) continue;
            if (!path.some((x) => nodes[x].cells.length > 1)) continue;
            const A = nodes[n0], B = nodes[m], targets = [];
            for (let c = 0; c < 81; c++) {
              if (s.values[c]) continue;
              for (const e of digitsOf(s.cands[c])) {
                const T = { d: e, cells: [c] };
                if (weakBetween(T, A) && weakBetween(T, B)) targets.push([c, e]);
              }
            }
            if (!targets.length) continue;
            const cells = [...new Set(path.flatMap((x) => nodes[x].cells))];
            const values = [...new Set(path.map((x) => nodes[x].d))];
            const chainText = path.map((x, i) => (i ? (i % 2 ? " = " : " – ") : "") + nText(x)).join("");
            const r = eliminate(s, targets, cells, values,
              `分组链：${chainText}（含多格的分组节点；= 强链，– 弱链）。若 ${nText(n0)} 为假则末端 ${nText(m)} 为真，所以两端至少一个为真，与两端都有弱链的候选数可排除`);
            if (r) return Object.assign(r, { chain: path.map((x) => ({ cells: nodes[x].cells, value: nodes[x].d })) });
          }
        }
        frontier = next;
      }
    }
    return null;
  }

  // ---------- ALS-XZ ----------
  // ALS（几乎锁定集）：同一单元内 n 个格，候选数共 n+1 个。
  // 两个 ALS 共有“限制数字”X（两边含 X 的格子两两互相看到），X 在两个 ALS 里至多一边为真，
  // 于是另一边变成 n 个格装 n 个数字的锁定集，必含另一共有数字 Z。同时看到两边所有 Z 的格子排除 Z。
  function findALSList(s) {
    const list = [], seen = new Set();
    for (let u = 0; u < 27; u++) {
      const empties = UNITS[u].filter((c) => !s.values[c]);
      for (let n = 1; n <= 4 && n < empties.length; n++) {
        combos(empties, n, (cs) => {
          let mask = 0;
          for (const c of cs) mask |= s.cands[c];
          if (POP[mask] === n + 1) {
            const key = cs.join(",");
            if (!seen.has(key)) { seen.add(key); list.push({ cells: cs.slice(), mask, unit: u }); }
          }
          return null;
        });
      }
    }
    return list;
  }

  function alsXZ(s) {
    const list = findALSList(s);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const A = list[i], B = list[j];
        const common = A.mask & B.mask;
        if (POP[common] < 2 || A.cells.some((c) => B.cells.includes(c))) continue;
        for (const x of digitsOf(common)) {
          const ax = A.cells.filter((c) => cellHas(s, c, x)), bx = B.cells.filter((c) => cellHas(s, c, x));
          if (!ax.every((a) => bx.every((b) => SEES[a][b]))) continue;
          for (const z of digitsOf(common)) {
            if (z === x) continue;
            const zc = [...A.cells, ...B.cells].filter((c) => cellHas(s, c, z));
            const targets = [];
            for (let c = 0; c < 81; c++) {
              if (cellHas(s, c, z) && !A.cells.includes(c) && !B.cells.includes(c) && zc.every((q) => SEES[c][q])) targets.push([c, z]);
            }
            const r = eliminate(s, targets, [...A.cells, ...B.cells], [x, z],
              `ALS-XZ：A=${A.cells.map(rcText).join("、")}（${A.cells.length} 格含数字 ${digitsOf(A.mask).join("")}），B=${B.cells.map(rcText).join("、")}（${B.cells.length} 格含数字 ${digitsOf(B.mask).join("")}）。限制数字 ${x}：A、B 中至多一边是 ${x}，另一边成为锁定集，必含 ${z}。同时看到所有 ${z} 的格子排除 ${z}`);
            if (r) return r;
          }
        }
      }
    }
    return null;
  }

  // ---------- ALS 链 ----------
  // 3～4 个互不重叠的 ALS 首尾相接，相邻两个有各自的限制数字（相邻限制数字不同）。
  // 链两端的 ALS 若含同一数字 Z（Z 不等于两端的限制数字），则两端至少一个含 Z，
  // 同时看到两端所有 Z 的格子排除 Z。
  function alsChain(s) {
    const list = findALSList(s);
    const N = list.length;
    if (N < 3) return null;
    const dc = list.map((a) => {
      const m = {};
      for (const d of digitsOf(a.mask)) m[d] = a.cells.filter((c) => cellHas(s, c, d));
      return m;
    });
    const disjoint = (a, b) => !a.cells.some((c) => b.cells.includes(c));
    // adj[i] = [[j, x], ...]：ALS i 与 j 以限制数字 x 相连
    const adj = Array.from({ length: N }, () => []);
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const common = list[i].mask & list[j].mask;
        if (!common || !disjoint(list[i], list[j])) continue;
        for (const x of digitsOf(common)) {
          if (dc[i][x].every((a) => dc[j][x].every((b) => SEES[a][b]))) {
            adj[i].push([j, x]);
            adj[j].push([i, x]);
          }
        }
      }
    }
    let budget = 300000;
    const MAX_ALS = 4;
    const chain = [], rcc = [];
    const check = () => {
      const A = list[chain[0]], B = list[chain[chain.length - 1]];
      const common = A.mask & B.mask;
      for (const z of digitsOf(common)) {
        if (z === rcc[0] || z === rcc[rcc.length - 1]) continue;
        const zc = [...A.cells, ...B.cells].filter((c) => cellHas(s, c, z));
        const targets = [];
        for (let c = 0; c < 81; c++) {
          if (cellHas(s, c, z) && !A.cells.includes(c) && !B.cells.includes(c) && zc.every((q) => SEES[c][q])) targets.push([c, z]);
        }
        const cells = [...new Set(chain.flatMap((i) => list[i].cells))];
        const text = chain.map((i, k) => `{${list[i].cells.map(rcText).join(" ")}}` + (k < rcc.length ? ` –${rcc[k]}– ` : "")).join("");
        const r = eliminate(s, targets, cells, [...new Set([...rcc, z])],
          `ALS 链：${text}。相邻 ALS 通过限制数字（括号间数字）相连，两端 ALS 必有一个含 ${z}。同时看到两端所有 ${z} 的格子排除 ${z}`);
        if (r) return r;
      }
      return null;
    };
    const dfs = () => {
      if (--budget < 0) return null;
      const last = chain[chain.length - 1];
      for (const [j, x] of adj[last]) {
        if (x === rcc[rcc.length - 1] || chain.some((i) => i === j || !disjoint(list[i], list[j]))) continue;
        chain.push(j);
        rcc.push(x);
        const r = (chain.length >= 3 ? check() : null) || (chain.length < MAX_ALS ? dfs() : null);
        chain.pop();
        rcc.pop();
        if (r) return r;
      }
      return null;
    };
    for (let i = 0; i < N; i++) {
      chain.push(i);
      const r = dfs();
      chain.pop();
      if (r) return Object.assign(r, { chain: null });
    }
    return null;
  }

  // ---------- Sue de Coq ----------
  // 行/列与宫的交叉区 I（2～3 格，候选并集 V，|V| = |I|+|A|+|C|）。
  // A 取自该行/列、交叉区之外；C 取自该宫、交叉区之外；A、C 候选数分别 ⊆ V 且互不相同。
  // 此时 I∪A∪C 的所有格必装下 V 中全部数字：A 的数字只能在 I∪A，C 的数字只能在 I∪C，其余数字只能在 I。
  function sueDeCoq(s) {
    for (let L = 0; L < 18; L++) {
      for (let b = 18; b < 27; b++) {
        const I = UNITS[L].filter((c) => !s.values[c] && UNITS[b].includes(c));
        if (I.length < 2) continue;
        let V = 0;
        for (const c of I) V |= s.cands[c];
        if (POP[V] < I.length + 2) continue;
        const al = UNITS[L].filter((c) => !s.values[c] && !UNITS[b].includes(c));
        const cl = UNITS[b].filter((c) => !s.values[c] && !UNITS[L].includes(c));
        const subsets = (arr) => {
          const out = [];
          for (let n = 1; n <= 3 && n <= arr.length; n++) {
            combos(arr, n, (cs) => {
              let m = 0;
              for (const c of cs) m |= s.cands[c];
              if ((m & ~V) === 0) out.push({ cells: cs.slice(), mask: m });
              return null;
            });
          }
          return out;
        };
        const As = subsets(al), Cs = subsets(cl);
        for (const A of As) {
          for (const C of Cs) {
            if ((A.mask & C.mask) !== 0 || I.length + A.cells.length + C.cells.length !== POP[V]) continue;
            const R = V & ~A.mask & ~C.mask;
            const inI = new Set([...I]);
            const targets = [];
            for (const c of UNITS[L]) {
              if (inI.has(c) || A.cells.includes(c)) continue;
              for (const d of digitsOf(A.mask)) targets.push([c, d]);
              for (const d of digitsOf(R)) targets.push([c, d]);
            }
            for (const c of UNITS[b]) {
              if (inI.has(c) || C.cells.includes(c)) continue;
              for (const d of digitsOf(C.mask)) targets.push([c, d]);
              for (const d of digitsOf(R)) targets.push([c, d]);
            }
            const r = eliminate(s, targets, [...I, ...A.cells, ...C.cells], digitsOf(V),
              `Sue de Coq：${unitName(L)}与${unitName(b)}的交叉区 ${I.map(rcText).join("、")} 含数字 ${digitsOf(V).join("")}；` +
              `A=${A.cells.map(rcText).join("、")}（数字 ${digitsOf(A.mask).join("")}），C=${C.cells.map(rcText).join("、")}（数字 ${digitsOf(C.mask).join("")}）。` +
              `这 ${POP[V]} 个格恰好装下这 ${POP[V]} 个数字：A 的数字只能在交叉区或 A 内，C 的数字只能在交叉区或 C 内，其余数字只能在交叉区内`);
            if (r) return r;
          }
        }
      }
    }
    return null;
  }

  // ---------- 强制链（Forcing Chain） ----------
  // 对一个“必有一个为真”的假设集合（双候选格的两个数，或单元内某数字仅剩 2～3 个位置），
  // 分别假设每一种情况并只用唯一候选数/唯一位置向前推导：
  //  · 只有一种假设不矛盾 → 该假设成立；
  //  · 各个不矛盾的假设得出相同的结论（同一格填同一数，或同一候选数被排除）→ 该结论成立。
  function propagateSingles(s, startCell, startDigit) {
    const v = Uint8Array.from(s.values), c = Uint16Array.from(s.cands);
    let broken = false;
    const assign = (cell, d) => {
      if (v[cell]) return v[cell] === d;
      if (!(c[cell] & (1 << d))) return false;
      v[cell] = d;
      c[cell] = 0;
      for (const p of PEERS[cell]) {
        if (v[p] === d) return false;
        c[p] &= ~(1 << d);
        if (!v[p] && c[p] === 0) return false;
      }
      return true;
    };
    if (!assign(startCell, startDigit)) return null;
    for (let guard = 0; guard < 90 && !broken; guard++) {
      let progress = false;
      for (let i = 0; i < 81 && !broken; i++) {
        if (!v[i] && POP[c[i]] === 1) {
          if (!assign(i, digitsOf(c[i])[0])) broken = true;
          progress = true;
        }
      }
      for (let u = 0; u < 27 && !broken; u++) {
        const unit = UNITS[u];
        for (let d = 1; d <= 9 && !broken; d++) {
          if (unit.some((q) => v[q] === d)) continue;
          let cnt = 0, at = -1;
          for (const q of unit) if (!v[q] && (c[q] & (1 << d))) { cnt++; at = q; }
          if (cnt === 0) broken = true;
          else if (cnt === 1) {
            if (!assign(at, d)) broken = true;
            progress = true;
          }
        }
      }
      if (!progress) break;
    }
    return broken ? null : { v, c };
  }

  function forcingChain(s) {
    const sources = [];
    for (let i = 0; i < 81; i++) {
      if (!s.values[i] && POP[s.cands[i]] === 2) sources.push(digitsOf(s.cands[i]).map((d) => [i, d]));
    }
    for (let u = 0; u < 27; u++) {
      for (let d = 1; d <= 9; d++) {
        const pos = UNITS[u].filter((c) => cellHas(s, c, d));
        if (pos.length === 2 || pos.length === 3) sources.push(pos.map((c) => [c, d]));
      }
    }
    const asText = (set) => set.map(([c, d]) => `${rcText(c)}=${d}`).join(" / ");
    for (const set of sources) {
      const outs = set.map(([c, d]) => propagateSingles(s, c, d));
      const alive = outs.filter(Boolean);
      const cells = [...new Set(set.map(([c]) => c))], values = [...new Set(set.map(([, d]) => d))];
      if (!alive.length) continue;
      if (alive.length === 1) {
        const [c, d] = set[outs.indexOf(alive[0])];
        return place(c, d, `强制链：${asText(set)} 必有一个成立，其余假设推到矛盾，所以 ${rcText(c)} 填 ${d}`);
      }
      for (let i = 0; i < 81; i++) {
        if (s.values[i]) continue;
        const val = alive[0].v[i];
        if (val && alive.every((o) => o.v[i] === val)) {
          return place(i, val, `强制链：${asText(set)} 必有一个成立；无论哪种假设，只用唯一候选数/唯一位置推下去，${rcText(i)} 都是 ${val}`);
        }
      }
      const targets = [];
      for (let i = 0; i < 81; i++) {
        if (s.values[i]) continue;
        for (const d of digitsOf(s.cands[i])) {
          if (alive.every((o) => o.v[i] !== d && !(o.c[i] & (1 << d)))) targets.push([i, d]);
        }
      }
      const r = eliminate(s, targets, cells, values,
        `强制链：${asText(set)} 必有一个成立；无论哪种假设，只用唯一候选数/唯一位置推下去，这些候选数都会被排除`);
      if (r) return r;
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
