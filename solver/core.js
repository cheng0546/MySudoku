// 求解器基础设施：单元/可见格预计算、位掩码工具、place/eliminate 操作构造器。
(() => {
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

  const rcText = (i) => `R${rowOf(i) + 1}C${colOf(i) + 1}`;
  const cellHas = (s, c, d) => !s.values[c] && (s.cands[c] & (1 << d)) !== 0;
  Object.assign(SolverKit, { UNITS, SEES, PEERS, POP, rowOf, colOf, boxOf, digitsOf, rc, unitName, combos, place, eliminate, rcText, cellHas });
})();
