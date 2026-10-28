// 候选数模式技巧：唯一数、区块摒除、数对/三数组、鱼类、Wing、Skyscraper、Kite、Unique Rectangle 等
(() => {
  const { UNITS, SEES, PEERS, POP, rowOf, colOf, boxOf, digitsOf, rc, unitName, combos, place, eliminate, rcText, cellHas, CHAIN_MAX_NODES } = SolverKit;
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
  };


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

  SolverKit.FINDERS = FINDERS;
})();
