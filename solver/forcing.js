// 多分支推理：强制链
(() => {
  const { UNITS, SEES, PEERS, POP, rowOf, colOf, boxOf, digitsOf, rc, unitName, combos, place, eliminate, rcText, cellHas, CHAIN_MAX_NODES } = SolverKit;
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

  SolverKit.FINDERS.forcing_chain = forcingChain;
})();
