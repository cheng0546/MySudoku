// 候选数关系图：强/弱链、AIC、X-Chain、XY-Chain、X-Cycle、分组链
(() => {
  const { UNITS, SEES, PEERS, POP, rowOf, colOf, boxOf, digitsOf, rc, unitName, combos, place, eliminate, rcText, cellHas, CHAIN_MAX_NODES } = SolverKit;
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

  Object.assign(SolverKit.FINDERS, {
    xy_chain: (s) => chainSearch(s, "xy"),
    x_chain: (s) => chainSearch(s, "x"),
    aic: (s) => chainSearch(s, "aic"),
    x_cycle: (s) => chainSearch(s, "xcycle"),
    grouped_aic: groupedSearch,
  });
})();
