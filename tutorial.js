// 技巧图文教学：图示数据 + SVG 绘制。图中坐标均为 1 起始（R 行 C 列）。
// 图示为“示意图”：只画出与推理相关的格子，其余格子留空。
const Tutorial = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  // ---------- 图示数据构造 ----------
  const G = (r, c, v, m) => ({ r, c, v, m });          // 题目给定数字
  const P = (r, c, p, m) => ({ r, c, p, m });          // 假设/推出后填入的数字
  const N = (r, c, cand, o = {}) => ({ r, c, cand, ...o }); // 候选数；k=强调，x=被排除，m=标记
  const D = (cells, o = {}) => ({ cells, ...o });      // rows/cols/boxes 为浅色区域，cap 为图注

  const MARK_STYLE = {
    pivot:  { fill: "#e0d4ff", label: "枢纽" },
    wing:   { fill: "#ffe0b3", label: "翼 / 关键格" },
    target: { fill: "#ffd0d0", label: "目标格" },
    base:   { fill: "#cdeccd", label: "关键格" },
    block:  { fill: "#e4e4e4", label: "该数字被挡住" },
    chain:  { fill: "#c9eef2", label: "链上的格子" },
  };

  // ---------- 基础概念 ----------
  const BASICS = [
    ["格 / 行 / 列 / 宫", "数独由 81 个格子组成：横向 9 条叫“行”，纵向 9 条叫“列”，粗线分出的 9 个 3×3 区域叫“宫”。行、列、宫统称“单元”，每个单元里 1~9 都必须恰好出现一次。"],
    ["坐标 R?C?", "本教学用 R3C5 表示“第 3 行第 5 列”的格子，R 是 Row（行），C 是 Column（列）。图的上方和左侧标有行列编号。"],
    ["候选数", "某个格子目前还有可能填的数字，就是它的候选数。图中格子里的小数字就是候选数。"],
    ["看到（同一单元）", "两个格子在同一行、同一列或同一宫，就说它们“互相看到”。看到的两个格子不能填相同的数字。"],
    ["排除", "确认某格不可能是某个数字后，把它从候选数里划掉。图中红色删除线的数字就是被排除的候选数。所有技巧的本质，要么是“填数”，要么是“排除候选数”。"],
  ];

  // ---------- 各技巧教学 ----------
  const LESSONS = {
    naked_single: {
      terms: [["裸（Naked）", "格子里的候选数都明明白白摆着。裸单数就是：这个格子只剩 1 个候选数。"]],
      sections: [
        { h: "场景", t: "看紫色格 R5C5。它所在的行、列、宫（浅蓝色区域）里已经出现了 1、2、3、4、5、6、7、8。",
          d: D([G(5, 1, 1), G(5, 2, 2), G(5, 3, 3), G(1, 5, 4), G(2, 5, 5), G(3, 5, 6), G(4, 4, 7), G(4, 6, 8), N(5, 5, "", { m: "target" })], { rows: [5], cols: [5], boxes: [5] }) },
        { h: "推理", t: "1~8 都被划掉了，R5C5 的候选数只剩 9，所以这格必定是 9。",
          d: D([G(5, 1, 1), G(5, 2, 2), G(5, 3, 3), G(1, 5, 4), G(2, 5, 5), G(3, 5, 6), G(4, 4, 7), G(4, 6, 8), P(5, 5, 9, "target")], { rows: [5], cols: [5], boxes: [5] }) },
      ],
      tip: "这是最基础的技巧：每填一个数，都先检查周围格子是否出现了只剩一个候选数的格子。",
    },

    hidden_single: {
      terms: [["隐（Hidden）", "答案“藏”在格子的其他候选数里。格子本身有多个候选数，但从单元的角度看，某个数字只有这一个位置可放。"]],
      sections: [
        { h: "场景", t: "观察第 1 宫（蓝色区域），想一想数字 7 能放在哪里。橙色的 7 已经出现在第 1 行、第 3 行、第 1 列、第 2 列，灰色格子都被 7 挡住了。",
          d: D([G(1, 5, 7, "wing"), G(3, 7, 7, "wing"), G(5, 1, 7, "wing"), G(8, 2, 7, "wing"),
            N(1, 1, "13", { m: "block" }), N(1, 2, "134", { m: "block" }), N(1, 3, "34", { m: "block" }),
            N(2, 1, "18", { m: "block" }), N(2, 2, "89", { m: "block" }), N(2, 3, "279", { m: "target", k: "7" }),
            N(3, 1, "15", { m: "block" }), N(3, 2, "56", { m: "block" }), N(3, 3, "36", { m: "block" })], { boxes: [1] }) },
        { h: "推理", t: "第 1 宫里只有 R2C3 还能放 7。虽然它还有 2、9 两个候选数，但宫里必须有一个 7，所以这格就是 7。",
          d: D([G(1, 5, 7, "wing"), G(3, 7, 7, "wing"), G(5, 1, 7, "wing"), G(8, 2, 7, "wing"), P(2, 3, 7, "target")], { boxes: [1] }) },
      ],
      tip: "找隐性唯一数的小窍门：选一个数字，逐个检查行、列、宫，看它在该单元里还能放几个格子。",
    },

    locked_candidates: {
      terms: [
        ["区块", "同一个数字在宫内的候选位置，全部落在同一行（或同一列）上，这几个格子就像被“锁”在一条线上。"],
        ["指向（Pointing）", "宫内的区块沿着行/列“指向”宫外，可以排除这条线在宫外的该数字。"],
        ["宣告（Claiming）", "反过来：行/列里某数字的候选全落在同一个宫内，这个宫“宣告”了它，宫内其余格子要排除该数字。"],
      ],
      sections: [
        { h: "指向：场景", t: "第 1 宫的第 1、3 行已被填满，数字 4 在这个宫里只能放在第 2 行的 3 个空格中（绿色）。",
          d: D([G(1, 1, 1), G(1, 2, 2), G(1, 3, 3), G(3, 1, 5), G(3, 2, 6), G(3, 3, 7),
            N(2, 1, "489", { k: "4", m: "base" }), N(2, 2, "48", { k: "4", m: "base" }), N(2, 3, "49", { k: "4", m: "base" }),
            N(2, 5, "47", { m: "target" }), N(2, 8, "149", { m: "target" })], { boxes: [1], rows: [2] }) },
        { h: "指向：结论", t: "这个宫的 4 一定落在第 2 行的三个绿格之一，所以第 2 行在宫外（红色格）不可能再有 4，把它们划掉。",
          d: D([N(2, 1, "489", { k: "4", m: "base" }), N(2, 2, "48", { k: "4", m: "base" }), N(2, 3, "49", { k: "4", m: "base" }),
            N(2, 5, "47", { m: "target", x: "4" }), N(2, 8, "149", { m: "target", x: "4" })], { boxes: [1], rows: [2] }) },
        { h: "宣告：场景与结论", t: "第 4 行里数字 3 只剩两个位置，R4C1 和 R4C2，都在第 4 宫。所以 3 一定在这两格里，第 4 宫内其他格子（红色）要划掉 3。",
          d: D([G(4, 3, 1), G(4, 4, 2), G(4, 5, 4), G(4, 6, 6), G(4, 7, 7), G(4, 8, 9),
            N(4, 1, "35", { k: "3", m: "base" }), N(4, 2, "38", { k: "3", m: "base" }), N(4, 9, "58"),
            N(5, 2, "36", { m: "target", x: "3" }), N(6, 3, "37", { m: "target", x: "3" })], { boxes: [4], rows: [4] }) },
      ],
      tip: "这是最常用的“排除”类技巧，往往排除之后就会出现新的唯一数。",
    },

    naked_pair: {
      terms: [["数对", "两个格子、两个数字。裸数对：两个格子的候选数一模一样，且都只有这两个数字。"]],
      sections: [
        { h: "场景", t: "第 4 行里，R4C2 和 R4C6 的候选数都是 {2,5}（紫色）。",
          d: D([G(4, 3, 3), G(4, 5, 4), G(4, 7, 6), G(4, 9, 1),
            N(4, 1, "258"), N(4, 2, "25", { m: "pivot", k: "25" }), N(4, 4, "289"), N(4, 6, "25", { m: "pivot", k: "25" }), N(4, 8, "579")], { rows: [4] }) },
        { h: "推理", t: "这两格要么 (2,5)，要么 (5,2)，2 和 5 肯定被它们用掉了。同一行其他格子（红色）不可能再是 2 或 5，划掉它们。",
          d: D([G(4, 3, 3), G(4, 5, 4), G(4, 7, 6), G(4, 9, 1),
            N(4, 1, "258", { m: "target", x: "25" }), N(4, 2, "25", { m: "pivot", k: "25" }), N(4, 4, "289", { m: "target", x: "2" }), N(4, 6, "25", { m: "pivot", k: "25" }), N(4, 8, "579", { m: "target", x: "5" })], { rows: [4] }) },
      ],
      tip: "数对也可以出现在列或宫里，原理完全一样：只在这个“单元”里排除。",
    },

    hidden_pair: {
      terms: [["隐性数对", "两个数字在单元里只出现在同样的两个格子，这两格的其他候选数是“多余”的，可以删掉。"]],
      sections: [
        { h: "场景", t: "第 7 行里，数字 3 和 6 只出现在 R7C2 和 R7C7 这两格（用蓝色强调），其他格子都没有 3、6。",
          d: D([G(7, 3, 2), G(7, 4, 4), G(7, 5, 5), G(7, 9, 7),
            N(7, 1, "18"), N(7, 2, "3689", { k: "36", m: "pivot" }), N(7, 6, "19"), N(7, 7, "1369", { k: "36", m: "pivot" }), N(7, 8, "189")], { rows: [7] }) },
        { h: "推理", t: "3 和 6 在这一行必须各占一格，而它们只能放进这两格，所以这两格就被 3、6 “占满”了，其他候选数（红色）全部划掉。",
          d: D([G(7, 3, 2), G(7, 4, 4), G(7, 5, 5), G(7, 9, 7),
            N(7, 1, "18"), N(7, 2, "3689", { k: "36", x: "89", m: "pivot" }), N(7, 6, "19"), N(7, 7, "1369", { k: "36", x: "19", m: "pivot" }), N(7, 8, "189")], { rows: [7] }) },
      ],
      tip: "裸数对是“删别人的候选”，隐性数对是“删自己格里的多余候选”，两者经常互为镜像。",
    },

    naked_triple: {
      terms: [["三数组", "三个格子的候选数合起来只有三个不同的数字（每格可以只含其中两个）。"]],
      sections: [
        { h: "场景", t: "第 2 行中，R2C1 {1,4}、R2C5 {4,7}、R2C8 {1,7}（紫色）。三格的候选数合起来只有 1、4、7 三个数字。",
          d: D([G(2, 2, 3), G(2, 4, 5), G(2, 7, 6), G(2, 9, 8),
            N(2, 1, "14", { m: "pivot" }), N(2, 3, "149"), N(2, 5, "47", { m: "pivot" }), N(2, 6, "27"), N(2, 8, "17", { m: "pivot" })], { rows: [2] }) },
        { h: "推理", t: "三个格子要放三个不同的数字，正好把 1、4、7 全用完。所以同一行其他格子（红色）要划掉 1、4、7。",
          d: D([G(2, 2, 3), G(2, 4, 5), G(2, 7, 6), G(2, 9, 8),
            N(2, 1, "14", { m: "pivot" }), N(2, 3, "149", { m: "target", x: "14" }), N(2, 5, "47", { m: "pivot" }), N(2, 6, "27", { m: "target", x: "7" }), N(2, 8, "17", { m: "pivot" })], { rows: [2] }) },
      ],
      tip: "裸三数组的三个格子不必都含三个数字，常见的是 {1,4}、{4,7}、{1,7} 这样的“环”。",
    },

    x_wing: {
      terms: [
        ["X-Wing", "四个格子在盘面上组成一个矩形，像字母 X 的四个端点，所以叫 X-Wing（X 翼）。"],
        ["基础行 / 覆盖列", "X-Wing 里候选恰好只有两个位置的两行叫“基础行”，这些位置所在的两列叫“覆盖列”。"],
      ],
      sections: [
        { h: "场景", t: "数字 6：第 2 行里只能放在第 3、7 列，第 8 行里也只能放在第 3、7 列。四个绿格构成矩形。",
          d: D([N(2, 3, "6", { m: "base", k: "6" }), N(2, 7, "6", { m: "base", k: "6" }), N(8, 3, "6", { m: "base", k: "6" }), N(8, 7, "6", { m: "base", k: "6" })], { rows: [2, 8] }) },
        { h: "推理 ①", t: "第 2 行的 6 和第 8 行的 6 必须在不同的列。情形一：R2C3 和 R8C7 是 6。",
          d: D([P(2, 3, 6, "base"), P(8, 7, 6, "base"), N(2, 7, ""), N(8, 3, "")], { rows: [2, 8], cols: [3, 7] }) },
        { h: "推理 ②", t: "情形二：R2C7 和 R8C3 是 6。",
          d: D([P(2, 7, 6, "base"), P(8, 3, 6, "base"), N(2, 3, ""), N(8, 7, "")], { rows: [2, 8], cols: [3, 7] }) },
        { h: "结论", t: "无论哪种情形，第 3 列和第 7 列里的 6 都被这个矩形“占用”了。所以这两列里其他格子（红色）要划掉 6。",
          d: D([N(2, 3, "6", { m: "base", k: "6" }), N(2, 7, "6", { m: "base", k: "6" }), N(8, 3, "6", { m: "base", k: "6" }), N(8, 7, "6", { m: "base", k: "6" }),
            N(5, 3, "269", { m: "target", x: "6" }), N(6, 7, "568", { m: "target", x: "6" })], { rows: [2, 8], cols: [3, 7] }) },
      ],
      tip: "行列可以互换：如果是两列里的候选位置落在同样两行，就排除这两行里其他格子的该数字。",
    },

    xy_wing: {
      terms: [
        ["双值格", "只有两个候选数的格子。XY-Wing 的三个格子都必须是双值格。"],
        ["枢纽（Pivot）", "三个格子里居中的那一个，候选数是 {X,Y}。它像一个铰链，连接着两个翼。"],
        ["翼（Wing）", "与枢纽互相看到的两个格子，候选分别是 {X,Z} 和 {Y,Z}，它们共享同一个数字 Z。"],
        ["目标格", "能同时看到两个翼的格子。它不可能是 Z，要把 Z 划掉。"],
      ],
      sections: [
        { h: "场景", t: "枢纽 R5C5 {1,2}（紫）。翼 R5C1 {1,5} 与它同行；翼 R2C5 {2,5} 与它同列（橙）。目标格 R2C1（红）同时看到两个翼：R2C1 与 R2C5 同行，与 R5C1 同列。",
          d: D([N(5, 5, "12", { m: "pivot" }), N(5, 1, "15", { m: "wing" }), N(2, 5, "25", { m: "wing" }), N(2, 1, "59", { m: "target", k: "5" })], { rows: [5], cols: [5] }) },
        { h: "推理 ①", t: "如果枢纽是 1：翼 {1,5} 与枢纽同行，不能再是 1，只能是 5。",
          d: D([P(5, 5, 1, "pivot"), P(5, 1, 5, "wing"), N(2, 5, "25", { m: "wing" }), N(2, 1, "59", { m: "target", x: "5" })], { rows: [5], cols: [5] }) },
        { h: "推理 ②", t: "如果枢纽是 2：翼 {2,5} 与枢纽同列，不能再是 2，只能是 5。",
          d: D([P(5, 5, 2, "pivot"), P(2, 5, 5, "wing"), N(5, 1, "15", { m: "wing" }), N(2, 1, "59", { m: "target", x: "5" })], { rows: [5], cols: [5] }) },
        { h: "结论", t: "枢纽只能是 1 或 2，两种情况下都会有一个翼是 5，而目标格同时看到两个翼，所以目标格不能是 5。",
          d: D([N(5, 5, "12", { m: "pivot" }), N(5, 1, "15", { m: "wing", k: "5" }), N(2, 5, "25", { m: "wing", k: "5" }), N(2, 1, "59", { m: "target", x: "5" })], { rows: [5], cols: [5] }) },
      ],
      tip: "找 XY-Wing 的顺序：先找一个双值格当枢纽，再在它能看到的双值格里找一对共享同一个数字的翼。",
    },

    skyscraper: {
      terms: [
        ["强链", "某数字在一个单元里只有两个位置时，这两个位置必定恰好一个为真，称为强链。"],
        ["底部 / 屋顶", "摩天楼由两条强链组成：它们在同一列（行）上的两格是“底部”，另外两格像楼顶，叫“屋顶”。"],
      ],
      sections: [
        { h: "场景", t: "数字 5：第 2 行只能放 C3、C8；第 8 行只能放 C3、C7。两行的 C3 同列，是底部（绿）；屋顶是 R2C8 和 R8C7（橙）。红格 R7C8、R9C8 同时看到两个屋顶。",
          d: D([N(2, 3, "5", { m: "base", k: "5" }), N(8, 3, "5", { m: "base", k: "5" }), N(2, 8, "5", { m: "wing", k: "5" }), N(8, 7, "5", { m: "wing", k: "5" }), N(7, 8, "59", { m: "target", k: "5" }), N(9, 8, "56", { m: "target", k: "5" })], { rows: [2, 8], lab: { wing: "屋顶" } }) },
        { h: "推理 ①", t: "底部两格同在第 3 列，不可能都是 5。若 R2C3 是 5，则第 8 行的 5 只能在 R8C7（屋顶）。",
          d: D([P(2, 3, 5, "base"), P(8, 7, 5, "wing")], { rows: [2, 8], cols: [3], lab: { wing: "屋顶" } }) },
        { h: "推理 ②", t: "若 R8C3 是 5，则第 2 行的 5 只能在 R2C8（屋顶）。",
          d: D([P(8, 3, 5, "base"), P(2, 8, 5, "wing")], { rows: [2, 8], cols: [3], lab: { wing: "屋顶" } }) },
        { h: "结论", t: "两个屋顶至少有一个是 5。红格同时看到两个屋顶（R7C8 与 R2C8 同列、与 R8C7 同宫），所以不能是 5。",
          d: D([N(2, 3, "5", { m: "base", k: "5" }), N(8, 3, "5", { m: "base", k: "5" }), N(2, 8, "5", { m: "wing", k: "5" }), N(8, 7, "5", { m: "wing", k: "5" }), N(7, 8, "59", { m: "target", x: "5" }), N(9, 8, "56", { m: "target", x: "5" })], { rows: [2, 8], lab: { wing: "屋顶" } }) },
      ],
      tip: "摩天楼是 X-Wing 的“歪”版本：X-Wing 的两个屋顶在同一列，摩天楼的屋顶不在同一列。",
    },

    two_string_kite: {
      terms: [
        ["强链", "数字在某行（或列）里只有两个位置，这两个位置恰好一个为真。"],
        ["风筝的结", "行上一格与列上一格在同一个宫里，它们互相看到，不能同时为真，就像风筝线打的结。"],
        ["两根线", "行上的强链和列上的强链就是风筝的两根线，线的另外两端叫“线端”。"],
      ],
      sections: [
        { h: "场景", t: "数字 7：第 3 行只有 R3C2、R3C8；第 3 列只有 R1C3、R8C3。R3C2 与 R1C3 同在第 1 宫（紫色，风筝的结）。线端是 R3C8 与 R8C3（橙）。红格 R8C8 同时看到两个线端。",
          d: D([N(3, 2, "7", { m: "pivot", k: "7" }), N(1, 3, "7", { m: "pivot", k: "7" }), N(3, 8, "7", { m: "wing", k: "7" }), N(8, 3, "7", { m: "wing", k: "7" }), N(8, 8, "79", { m: "target", k: "7" })], { boxes: [1], lab: { pivot: "风筝的结", wing: "线端" } }) },
        { h: "推理 ①", t: "如果 R3C2 是 7，同宫的 R1C3 就不能是 7，于是第 3 列的 7 只能在 R8C3。",
          d: D([P(3, 2, 7, "pivot"), P(8, 3, 7, "wing")], { boxes: [1], lab: { pivot: "风筝的结", wing: "线端" } }) },
        { h: "推理 ②", t: "如果 R3C2 不是 7，那么第 3 行的 7 只能在 R3C8。",
          d: D([P(3, 8, 7, "wing")], { rows: [3], lab: { wing: "线端" } }) },
        { h: "结论", t: "两个线端至少有一个是 7。R8C8 与 R8C3 同行、与 R3C8 同列，同时看到两端，所以不能是 7。",
          d: D([N(3, 2, "7", { m: "pivot", k: "7" }), N(1, 3, "7", { m: "pivot", k: "7" }), N(3, 8, "7", { m: "wing", k: "7" }), N(8, 3, "7", { m: "wing", k: "7" }), N(8, 8, "79", { m: "target", x: "7" })], { boxes: [1], lab: { pivot: "风筝的结", wing: "线端" } }) },
      ],
      tip: "叫“风筝”是因为一行一列加上结，形状像一只风筝。它和摩天楼都是“两条强链”的结构。",
    },

    finned_x_wing: {
      terms: [
        ["鳍（Fin）", "标准 X-Wing 里，某一行不该出现的多余候选位置，就像鱼身上多出来的鳍。"],
        ["带鳍", "只要鳍都落在同一个宫里，就还能得出部分排除结论，只是排除范围缩小到那个宫内。"],
      ],
      sections: [
        { h: "场景", t: "数字 4：第 1 行只有 C2、C7；第 4 行有 C2、C7，还多了 R4C3（鳍，橙色）。鳍与 R4C2 同在第 4 宫。",
          d: D([N(1, 2, "4", { m: "base", k: "4" }), N(1, 7, "4", { m: "base", k: "4" }), N(4, 2, "4", { m: "base", k: "4" }), N(4, 7, "4", { m: "base", k: "4" }), N(4, 3, "4", { m: "wing", k: "4" }),
            N(5, 2, "49", { m: "target" }), N(6, 2, "46", { m: "target" })], { rows: [1, 4], boxes: [4], lab: { wing: "鳍" } }) },
        { h: "推理 ①", t: "如果鳍 R4C3 是 4，它所在第 4 宫里被它看到的格子（红色）都不能是 4。",
          d: D([P(4, 3, 4, "wing"), N(5, 2, "49", { m: "target", x: "4" }), N(6, 2, "46", { m: "target", x: "4" })], { boxes: [4], lab: { wing: "鳍" } }) },
        { h: "推理 ②", t: "如果鳍不是 4，第 4 行的 4 只能在 C2、C7，成为标准 X-Wing。其中一种排布：R1C7 与 R4C2 是 4。",
          d: D([P(1, 7, 4, "base"), P(4, 2, 4, "base")], { rows: [1, 4], cols: [2, 7] }) },
        { h: "推理 ③", t: "另一种排布：R1C2 与 R4C7 是 4。无论哪种，第 2 列的 4 都在第 1、4 行里，第 2 列其他格（含红格）不能是 4。",
          d: D([P(1, 2, 4, "base"), P(4, 7, 4, "base")], { rows: [1, 4], cols: [2, 7] }) },
        { h: "结论", t: "鳍为真或为假，红格都不能是 4，划掉。注意：只能排除“鳍所在宫内、矩形那一列”上的格子。",
          d: D([N(1, 2, "4", { m: "base", k: "4" }), N(1, 7, "4", { m: "base", k: "4" }), N(4, 2, "4", { m: "base", k: "4" }), N(4, 7, "4", { m: "base", k: "4" }), N(4, 3, "4", { m: "wing", k: "4" }),
            N(5, 2, "49", { m: "target", x: "4" }), N(6, 2, "46", { m: "target", x: "4" })], { rows: [1, 4], boxes: [4], lab: { wing: "鳍" } }) },
      ],
      tip: "没有鳍就是标准 X-Wing。带鳍 X-Wing 能解决许多“差一点就是 X-Wing”的局面。",
    },

    unique_rectangle: {
      terms: [
        ["唯一解", "一道合格的数独只有一个答案。这个技巧正是利用“不能出现两个答案”来推理。"],
        ["致命矩形（Deadly Pattern）", "四个格子都只有 {a,b} 时，a、b 可以互换，会产生两个答案，所以这种局面不可能出现。"],
        ["类型 1", "唯一矩形有多种类型，本站目前只实现最基本的类型 1：三格是 {a,b}，第四格还有额外候选。"],
      ],
      sections: [
        { h: "场景", t: "矩形 R1C1、R1C4、R2C1、R2C4 跨第 1、2 两个宫。前三格都是 {3,7}（紫色），第四格 R2C4 是 {3,7,9}（红色）。",
          d: D([N(1, 1, "37", { m: "pivot" }), N(1, 4, "37", { m: "pivot" }), N(2, 1, "37", { m: "pivot" }), N(2, 4, "379", { m: "target" })], { lab: { pivot: "同样的 {3,7}" } }) },
        { h: "推理 ①", t: "假设 R2C4 取 3 或 7，四格就都在 {3,7} 里。这个矩形有一种填法……",
          d: D([P(1, 1, 3, "pivot"), P(1, 4, 7, "pivot"), P(2, 1, 7, "pivot"), P(2, 4, 3, "target")]) },
        { h: "推理 ②", t: "……互换 3、7 后又是一种合法填法。这样题目就有两个答案，与“唯一解”矛盾。",
          d: D([P(1, 1, 7, "pivot"), P(1, 4, 3, "pivot"), P(2, 1, 3, "pivot"), P(2, 4, 7, "target")]) },
        { h: "结论", t: "所以 R2C4 不能是 3 或 7，只剩 9。",
          d: D([N(1, 1, "37", { m: "pivot" }), N(1, 4, "37", { m: "pivot" }), N(2, 1, "37", { m: "pivot" }), N(2, 4, "379", { m: "target", x: "37", k: "9" })], { lab: { pivot: "同样的 {3,7}" } }) },
      ],
      tip: "矩形必须恰好跨两个宫。这个技巧依赖唯一解，所以只能用在保证唯一解的题目上。",
    },

    jellyfish: {
      terms: [["水母（Jellyfish）", "四行四列版本的“鱼”。比 Swordfish 更大，但推理方式完全一样。"]],
      sections: [
        { h: "场景", t: "数字 2：第 1、3、6、8 行里的候选位置，合起来只占第 2、4、7、9 列。每行恰好两处，首尾相连成环。",
          d: D([N(1, 2, "2", { m: "base", k: "2" }), N(1, 4, "2", { m: "base", k: "2" }), N(3, 4, "2", { m: "base", k: "2" }), N(3, 7, "2", { m: "base", k: "2" }),
            N(6, 7, "2", { m: "base", k: "2" }), N(6, 9, "2", { m: "base", k: "2" }), N(8, 9, "2", { m: "base", k: "2" }), N(8, 2, "2", { m: "base", k: "2" })], { rows: [1, 3, 6, 8] }) },
        { h: "推理 ①", t: "四行各需要一个 2，且不能同列。一种分配：R1C2、R3C4、R6C7、R8C9。",
          d: D([P(1, 2, 2, "base"), P(3, 4, 2, "base"), P(6, 7, 2, "base"), P(8, 9, 2, "base")], { rows: [1, 3, 6, 8], cols: [2, 4, 7, 9] }) },
        { h: "推理 ②", t: "另一种分配：R1C4、R3C7、R6C9、R8C2。",
          d: D([P(1, 4, 2, "base"), P(3, 7, 2, "base"), P(6, 9, 2, "base"), P(8, 2, 2, "base")], { rows: [1, 3, 6, 8], cols: [2, 4, 7, 9] }) },
        { h: "结论", t: "两种分配下，第 2、4、7、9 列的 2 都被这四行用完了。这四列里其他格子（红色）要划掉 2。",
          d: D([N(1, 2, "2", { m: "base", k: "2" }), N(1, 4, "2", { m: "base", k: "2" }), N(3, 4, "2", { m: "base", k: "2" }), N(3, 7, "2", { m: "base", k: "2" }),
            N(6, 7, "2", { m: "base", k: "2" }), N(6, 9, "2", { m: "base", k: "2" }), N(8, 9, "2", { m: "base", k: "2" }), N(8, 2, "2", { m: "base", k: "2" }),
            N(5, 2, "256", { m: "target", x: "2" }), N(9, 4, "249", { m: "target", x: "2" }), N(2, 7, "238", { m: "target", x: "2" }), N(7, 9, "127", { m: "target", x: "2" })], { rows: [1, 3, 6, 8], cols: [2, 4, 7, 9] }) },
      ],
      tip: "鱼的规律：X-Wing(2) → Swordfish(3) → Jellyfish(4)。实战中 Jellyfish 极其少见。",
    },

    xyz_wing: {
      terms: [
        ["XYZ-Wing", "XY-Wing 的变形：枢纽有三个候选数 {X,Y,Z}，两个翼是 {X,Z} 和 {Y,Z}。"],
        ["枢纽 / 翼", "含义同 XY-Wing。这里枢纽自己也含有公共数字 Z，所以目标格要同时看到“枢纽和两个翼”三个格子。"],
      ],
      sections: [
        { h: "场景", t: "枢纽 R5C5 {1,2,5}（紫）。翼 R5C1 {1,5} 与枢纽同行，翼 R4C4 {2,5} 与枢纽同宫（橙）。R5C4 和 R5C6（红）同时看到三个格子。",
          d: D([N(5, 5, "125", { m: "pivot" }), N(5, 1, "15", { m: "wing" }), N(4, 4, "25", { m: "wing" }), N(5, 4, "58", { m: "target", k: "5" }), N(5, 6, "57", { m: "target", k: "5" })], { rows: [5], boxes: [5] }) },
        { h: "推理 ①", t: "如果枢纽是 5：与它同行的红格自然不能是 5。",
          d: D([P(5, 5, 5, "pivot"), N(5, 1, "15", { m: "wing" }), N(4, 4, "25", { m: "wing" }), N(5, 4, "58", { m: "target", x: "5" }), N(5, 6, "57", { m: "target", x: "5" })], { rows: [5], boxes: [5] }) },
        { h: "推理 ②", t: "如果枢纽是 1：翼 {1,5} 只能是 5，它与红格同行，红格不能是 5。",
          d: D([P(5, 5, 1, "pivot"), P(5, 1, 5, "wing"), N(4, 4, "25", { m: "wing" }), N(5, 4, "58", { m: "target", x: "5" }), N(5, 6, "57", { m: "target", x: "5" })], { rows: [5], boxes: [5] }) },
        { h: "推理 ③", t: "如果枢纽是 2：翼 {2,5} 只能是 5，它与红格同宫，红格不能是 5。",
          d: D([P(5, 5, 2, "pivot"), P(4, 4, 5, "wing"), N(5, 1, "15", { m: "wing" }), N(5, 4, "58", { m: "target", x: "5" }), N(5, 6, "57", { m: "target", x: "5" })], { rows: [5], boxes: [5] }) },
        { h: "结论", t: "三种情况里 5 总会出现在三个格子之一，而红格都能看到它们，所以红格里的 5 要划掉。",
          d: D([N(5, 5, "125", { m: "pivot", k: "5" }), N(5, 1, "15", { m: "wing", k: "5" }), N(4, 4, "25", { m: "wing", k: "5" }), N(5, 4, "58", { m: "target", x: "5" }), N(5, 6, "57", { m: "target", x: "5" })], { rows: [5], boxes: [5] }) },
      ],
      tip: "区分：XY-Wing 的枢纽只有 2 个候选数；XYZ-Wing 的枢纽有 3 个，且目标格要看到枢纽本身。",
    },

    swordfish: {
      terms: [
        ["鱼（Fish）", "X-Wing、Swordfish（剑鱼）、Jellyfish（水母）统称“鱼”，数字越大的鱼，用到的行列越多。"],
        ["基础行 / 覆盖列", "候选位置被限制住的三行叫“基础行”，这些位置所在的三列叫“覆盖列”。"],
      ],
      sections: [
        { h: "场景", t: "数字 4：第 1 行只能放第 2、5 列；第 4 行只能放第 5、8 列；第 7 行只能放第 2、8 列。三行的候选都落在第 2、5、8 列里。",
          d: D([N(1, 2, "4", { m: "base", k: "4" }), N(1, 5, "4", { m: "base", k: "4" }), N(4, 5, "4", { m: "base", k: "4" }), N(4, 8, "4", { m: "base", k: "4" }), N(7, 2, "4", { m: "base", k: "4" }), N(7, 8, "4", { m: "base", k: "4" })], { rows: [1, 4, 7] }) },
        { h: "推理 ①", t: "三行各需要一个 4，且它们不能在同一列。其中一种分配：R1C2、R4C5、R7C8。",
          d: D([P(1, 2, 4, "base"), P(4, 5, 4, "base"), P(7, 8, 4, "base")], { rows: [1, 4, 7], cols: [2, 5, 8] }) },
        { h: "推理 ②", t: "另一种分配：R1C5、R4C8、R7C2。",
          d: D([P(1, 5, 4, "base"), P(4, 8, 4, "base"), P(7, 2, 4, "base")], { rows: [1, 4, 7], cols: [2, 5, 8] }) },
        { h: "结论", t: "无论哪种分配，第 2、5、8 列的 4 都被这三行用掉了。所以这三列里其他格子（红色）要划掉 4。",
          d: D([N(1, 2, "4", { m: "base", k: "4" }), N(1, 5, "4", { m: "base", k: "4" }), N(4, 5, "4", { m: "base", k: "4" }), N(4, 8, "4", { m: "base", k: "4" }), N(7, 2, "4", { m: "base", k: "4" }), N(7, 8, "4", { m: "base", k: "4" }),
            N(3, 2, "349", { m: "target", x: "4" }), N(6, 5, "468", { m: "target", x: "4" }), N(8, 8, "145", { m: "target", x: "4" })], { rows: [1, 4, 7], cols: [2, 5, 8] }) },
      ],
      tip: "Swordfish 的每一行不一定都有 3 个候选位置，2 个也可以，只要三行的位置合起来恰好占三列。",
    },

    xy_chain: {
      terms: [
        ["链（Chain）", "把若干个双值格一格接一格地连起来：相邻两格互相看到，并共享一个数字，这条线索就是“链”。"],
        ["链端", "链的第一个格和最后一个格。XY-Chain 的结论只和两个链端有关。"],
        ["传导", "如果链的一端不是 A，就会一环扣一环地推出另一端必定是 A。"],
      ],
      sections: [
        { h: "场景", t: "链：R1C1 {1,2} → R1C5 {2,3} → R5C5 {3,4} → R5C9 {1,4}（青色）。相邻格互相看到并共享一个数字（2、3、4）。两端都含有 1。红色格 R1C9、R5C1 同时看到两个链端。",
          d: D([N(1, 1, "12", { m: "chain" }), N(1, 5, "23", { m: "chain" }), N(5, 5, "34", { m: "chain" }), N(5, 9, "14", { m: "chain" }),
            N(1, 9, "17", { m: "target", k: "1" }), N(5, 1, "18", { m: "target", k: "1" })]) },
        { h: "推理 ①", t: "如果左上端点 R1C1 不是 1，那就是 2。于是 R1C5 不能是 2，只能是 3；R5C5 不能是 3，只能是 4；R5C9 不能是 4，只能是 1。",
          d: D([P(1, 1, 2, "chain"), P(1, 5, 3, "chain"), P(5, 5, 4, "chain"), P(5, 9, 1, "chain")]) },
        { h: "推理 ②", t: "如果 R1C1 是 1，当然就是 1。",
          d: D([P(1, 1, 1, "chain"), N(1, 5, "23", { m: "chain" }), N(5, 5, "34", { m: "chain" }), N(5, 9, "14", { m: "chain" })]) },
        { h: "结论", t: "不论怎样，两个链端中至少有一个是 1。同时看到两端的格子（红色）不可能是 1，划掉。",
          d: D([N(1, 1, "12", { m: "chain", k: "1" }), N(1, 5, "23", { m: "chain" }), N(5, 5, "34", { m: "chain" }), N(5, 9, "14", { m: "chain", k: "1" }),
            N(1, 9, "17", { m: "target", x: "1" }), N(5, 1, "18", { m: "target", x: "1" })]) },
      ],
      tip: "链越长越难发现。XY-Wing 其实就是只有 3 个格子的 XY-Chain。",
    },
  };

  // ---------- SVG 绘制 ----------
  const el = (name, attrs, text) => {
    const e = document.createElementNS(SVG_NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    return e;
  };

  function drawDiagram(spec) {
    const S = 40, M = 18, W = M + S * 9 + 2;
    const svg = el("svg", { viewBox: `0 0 ${W} ${W}`, class: "diagram", role: "img" });
    const X = (c) => M + (c - 1) * S;
    const Y = (r) => M + (r - 1) * S;
    const rect = (x, y, w, h, fill) => svg.appendChild(el("rect", { x, y, width: w, height: h, fill }));

    svg.appendChild(el("rect", { x: M, y: M, width: S * 9, height: S * 9, fill: "#fff" }));
    for (const r of spec.rows || []) rect(M, Y(r), S * 9, S, "#e3edff");
    for (const c of spec.cols || []) rect(X(c), M, S, S * 9, "#e3edff");
    for (const b of spec.boxes || []) rect(X(((b - 1) % 3) * 3 + 1), Y(Math.floor((b - 1) / 3) * 3 + 1), S * 3, S * 3, "#e3edff");
    for (const cell of spec.cells) {
      if (cell.m) rect(X(cell.c), Y(cell.r), S, S, MARK_STYLE[cell.m].fill);
    }

    for (let i = 0; i <= 9; i++) {
      const thick = i % 3 === 0;
      const attrs = { stroke: thick ? "#333" : "#bbb", "stroke-width": thick ? 1.8 : 0.6 };
      svg.appendChild(el("line", { x1: M, y1: M + i * S, x2: M + 9 * S, y2: M + i * S, ...attrs }));
      svg.appendChild(el("line", { x1: M + i * S, y1: M, x2: M + i * S, y2: M + 9 * S, ...attrs }));
    }
    for (let i = 1; i <= 9; i++) {
      const lab = { "font-size": 11, fill: "#889", "text-anchor": "middle" };
      svg.appendChild(el("text", { x: X(i) + S / 2, y: 13, ...lab }, i));
      svg.appendChild(el("text", { x: 9, y: Y(i) + S / 2 + 4, ...lab }, i));
    }

    for (const cell of spec.cells) {
      const x0 = X(cell.c), y0 = Y(cell.r);
      if (cell.v || cell.p) {
        svg.appendChild(el("text", {
          x: x0 + S / 2, y: y0 + S / 2 + 8, "font-size": 24, "text-anchor": "middle",
          fill: cell.p ? "#1a8a3a" : "#222", "font-weight": cell.p ? 700 : 500,
        }, cell.v || cell.p));
        continue;
      }
      for (const ch of cell.cand || "") {
        const d = +ch;
        const x = x0 + 8 + ((d - 1) % 3) * 12, y = y0 + 12 + Math.floor((d - 1) / 3) * 12;
        const key = (cell.k || "").includes(ch), gone = (cell.x || "").includes(ch);
        svg.appendChild(el("text", {
          x, y: y + 3, "font-size": 12, "text-anchor": "middle",
          fill: gone ? "#d00" : key ? "#1456d6" : "#555", "font-weight": key || gone ? 700 : 400,
        }, ch));
        if (gone) svg.appendChild(el("line", { x1: x - 5, y1: y + 8, x2: x + 5, y2: y - 4, stroke: "#d00", "stroke-width": 1.5 }));
      }
    }
    return svg;
  }

  function diagramBlock(spec) {
    const wrap = document.createElement("figure");
    wrap.className = "figure";
    wrap.appendChild(drawDiagram(spec));
    const used = [...new Set(spec.cells.map((c) => c.m).filter(Boolean))];
    if (used.length) {
      const legend = document.createElement("div");
      legend.className = "legend";
      for (const m of used) {
        const s = document.createElement("span");
        s.innerHTML = '<i class="swatch"></i>';
        s.firstChild.style.background = MARK_STYLE[m].fill;
        s.append((spec.lab && spec.lab[m]) || MARK_STYLE[m].label);
        legend.appendChild(s);
      }
      wrap.appendChild(legend);
    }
    return wrap;
  }

  const para = (cls, html, text) => {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    if (html) {
      const s = document.createElement("strong");
      s.textContent = html;
      p.append(s, text);
    } else {
      p.textContent = text;
    }
    return p;
  };

  function renderTerms(container, title, terms) {
    const h = document.createElement("h4");
    h.textContent = title;
    container.appendChild(h);
    for (const [term, text] of terms) container.appendChild(para("term", term + "：", text));
  }

  // 完整图文教学（供提示弹窗和技巧教学页共用）
  function renderLesson(container, key) {
    const help = SudokuSolver.TECHNIQUE_HELP[key];
    const lesson = LESSONS[key];
    container.appendChild(para("", "一句话：", help.summary));
    container.appendChild(para("", "怎么找：", help.how));
    if (lesson.terms.length) renderTerms(container, "专业词汇", lesson.terms);
    const h = document.createElement("h4");
    h.textContent = "图解示范";
    container.appendChild(h);
    lesson.sections.forEach((s, i) => {
      container.appendChild(para("step", `${i + 1}. ${s.h}：`, s.t));
      container.appendChild(diagramBlock(s.d));
    });
    if (lesson.tip) container.appendChild(para("example", "小提示：", lesson.tip));
  }

  function renderBasics(container) {
    renderTerms(container, "先认识几个基本概念", BASICS);
  }

  return { renderLesson, renderBasics };
})();
