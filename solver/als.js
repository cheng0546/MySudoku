// 组合技巧：ALS-XZ、ALS 链、Sue de Coq
(() => {
  const { UNITS, SEES, PEERS, POP, rowOf, colOf, boxOf, digitsOf, rc, unitName, unitKind, L: LS, combos, place, eliminate, rcText, cellHas, CHAIN_MAX_NODES } = SolverKit;
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
              I18n.t("r.als_xz", { a: LS(A.cells.map(rcText)), na: A.cells.length, da: digitsOf(A.mask).join(""), b: LS(B.cells.map(rcText)), nb: B.cells.length, db: digitsOf(B.mask).join(""), x, z }));
            if (r) return Object.assign(r, { chain: [A, B].map((a, k) => ({ cells: a.cells, value: k ? 0 : x })) });
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
          I18n.t("r.als_chain", { chain: text, z }));
        if (r) return Object.assign(r, { chain: chain.map((i, k) => ({ cells: list[i].cells, value: rcc[k] || 0 })) });
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
      if (r) return r;
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
              I18n.t("r.sue", {
                u1: unitName(L), u2: unitName(b), i: LS(I.map(rcText)), v: digitsOf(V).join(""), n: POP[V],
                a: LS(A.cells.map(rcText)), da: digitsOf(A.mask).join(""), c: LS(C.cells.map(rcText)), dc: digitsOf(C.mask).join(""),
              }));
            if (r) return r;
          }
        }
      }
    }
    return null;
  }

  Object.assign(SolverKit.FINDERS, { als_xz: alsXZ, als_chain: alsChain, sue_de_coq: sueDeCoq });
})();
