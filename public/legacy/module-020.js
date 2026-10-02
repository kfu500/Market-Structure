// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  "use strict";
  const D = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 0)).textContent), C = window.MarketChartCover, E = x => String(x ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 1)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 2), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 3)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 4)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 5),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 6)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 7),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 8)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 9),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 10)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 11),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 12)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 13)
  })[c]);
  const colors = [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 14), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 15), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 16), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 17), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 18), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 19)];
  let contextMode = false, mode = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 20), category = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 21), serial = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 22);
  const exports = new Map();
  const definitions = {
    cash: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 23), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 24), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 25), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 26), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 27), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 28), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 29)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 30), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 31), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 32), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 33), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 34)]]],
    options: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 35), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 36), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 37), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 38), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 39), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 40), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 41), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 42)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 43), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 44), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 45), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 46)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 47), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 48), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 49), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 50)]]],
    futures: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 51), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 52), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 53), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 54), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 55), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 56), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 57), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 58)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 59), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 60), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 61), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 62), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 63)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 64), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 65), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 66)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 67), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 68), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 69)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 70), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 71), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 72)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 73), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 74), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 75)]]],
    europe: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 76), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 77), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 78)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 79), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 80), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 81)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 82), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 83), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 84), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 85)]]],
    fixed: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 86), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 87), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 88), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 89)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 90), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 91), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 92)]]],
    fx: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 93), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 94), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 95), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 96)]]],
    crypto: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 97), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 98), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 99)]]]
  };
  const company = {
    CME: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 100), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 101), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 102), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 103), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 104), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 105), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 106), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 107)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 108), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 109), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 110)]]],
    ICE: [definitions.cash[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 111)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 112), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 113), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 114), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 115), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 116)]], [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 117), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 118), [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 119)]]],
    CBOE: [definitions.cash[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 120)], ...definitions.options, definitions.futures[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 121)]],
    NDAQ: [definitions.cash[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 122)], definitions.options[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 123)], definitions.europe[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 124)]],
    TW: definitions.fixed,
    HOOD: definitions.crypto
  };
  function point(s, r, c) {
    const v = r[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 125) + s.columns.indexOf(c)];
    return v == null ? null : v * (s.meta[c].kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 126) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 127) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 128));
  }
  function csv(rows) {
    const keys = Object.keys(rows[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 129)] || ({})), esc = x => __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 130) + String(x ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 131)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 132), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 133)), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 134)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 135);
    return [keys, ...rows.map(r => keys.map(k => r[k]))].map(r => r.map(esc).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 136))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 137));
  }
  function save(name, text, type) {
    const u = URL.createObjectURL(new Blob([text], {
      type
    })), a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 138));
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 139));
  }
  function rowsFor(k, p) {
    const s = D.data[k], rows = s[p].map(r => r.slice());
    for (const d of D.audit.duplicate_dates_quarantined) if (d.sheet === s.sheet && d.period === p) rows.push([d.date, null, ...s.columns.map(() => null)]);
    return rows.sort((a, b) => a[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 140)].localeCompare(b[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 141)]));
  }
  function card(k, title, cols, p = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 142), count = null) {
    const s = D.data[k], share = s.meta[cols[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 143)]].kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 144), stock = s.meta[cols[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 145)]].kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 146), all = rowsFor(k, p), last = all.filter(r => cols.some(c => point(s, r, c) != null)).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 147));
    if (!last) return __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 148);
    const end = all.indexOf(last), rows = all.slice(Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 149), end - (count || (p === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 150) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 151) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 152))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 153)), end + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 154)), unit = share ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 155) : s.unit + (p === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 156) && !stock ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 157) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 158)), labels = rows.map(r => p === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 159) ? r[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 160)].slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 161), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 162)) : r[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 163)].slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 164))), sets = cols.map((c, i) => ({
      name: s.meta[c].name,
      values: rows.map(r => point(s, r, c)),
      color: colors[i]
    })), id = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 165) + ++serial;
    const exportRows = all.flatMap(r => cols.map(c => ({
      period: r[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 166)],
      frequency: p,
      metric: s.meta[c].name,
      value: point(s, r, c),
      unit,
      classification: stock ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 167) : share ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 168) : p === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 169) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 170) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 171),
      provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 172),
      source_file: (D.row_provenance?.[k + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 173) + p + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 174) + r[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 175)]] || D.source).file_name,
      sheet: s.sheet,
      cell: r[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 176)] ? c + r[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 177)] : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 178),
      source_sha256: (D.row_provenance?.[k + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 179) + p + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 180) + r[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 181)]] || D.source).sha256
    })));
    exports.set(id, exportRows);
    const latest = cols.map(c => {
      const r = all.filter(r => point(s, r, c) != null).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 182));
      return r ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 183) + __MARKET_STRUCTURE_RUNTIME__.template(s.meta[c].name) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 184) + __MARKET_STRUCTURE_RUNTIME__.template(point(s, r, c).toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 185), {
        maximumFractionDigits: share ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 186) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 187)
      })) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 188) + __MARKET_STRUCTURE_RUNTIME__.template(r[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 189)]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 190) : s.meta[c].name + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 191);
    });
    let warning = k === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 192) && cols.some(c => [__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 193), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 194), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 195), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 196), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 197), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 198), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 199), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 200)].includes(c)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 201) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 202);
    if (k === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 203) && cols.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 204))) warning += __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 205);
    const mt = p === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 206) && s.mtd && !stock && k !== __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 207) ? cols.map(c => s.mtd[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 208) + s.columns.indexOf(c)] == null ? null : s.meta[c].name + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 209) + (D.mtd_source_snapshot?.cutoffs?.[k]?.[c] || s.meta[c].last) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 210) + point(s, s.mtd, c).toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 211), {
      maximumFractionDigits: share ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 212) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 213)
    })).filter(Boolean).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 214)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 215);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 216) + __MARKET_STRUCTURE_RUNTIME__.template(p === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 217) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 218) : stock ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 219) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 220)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 221) + __MARKET_STRUCTURE_RUNTIME__.template(E(title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 222) + __MARKET_STRUCTURE_RUNTIME__.template(E((stock ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 223) : share ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 224) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 225)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 226) + last[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 227)] + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 228) + unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 229) + __MARKET_STRUCTURE_RUNTIME__.template(C.graph(labels, sets, {
      unit,
      title
    })) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 230) + __MARKET_STRUCTURE_RUNTIME__.template(E(warning)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 231) + __MARKET_STRUCTURE_RUNTIME__.template(p === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 232) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 233) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 234)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 235) + __MARKET_STRUCTURE_RUNTIME__.template(E(latest.join(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 236)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 237) + __MARKET_STRUCTURE_RUNTIME__.template(mt ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 238) + __MARKET_STRUCTURE_RUNTIME__.template(E(mt)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 239) + __MARKET_STRUCTURE_RUNTIME__.template(E(unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 240) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 241)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 242) + __MARKET_STRUCTURE_RUNTIME__.template(E(s.scope)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 243) + __MARKET_STRUCTURE_RUNTIME__.template(E((D.row_provenance?.[k + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 244) + p + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 245) + last[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 246)]] || D.source).file_name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 247) + __MARKET_STRUCTURE_RUNTIME__.template(E(s.sheet)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 248) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.source.received_at)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 249) + __MARKET_STRUCTURE_RUNTIME__.template(id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 250);
  }
  function bind(el) {
    el.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 251)).forEach(b => b.onclick = () => save(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 252) + b.dataset.rjExport + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 253), csv(exports.get(b.dataset.rjExport)), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 254)));
    el.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 255)).forEach(b => b.onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 256)));
    el.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 257)).forEach(b => b.onclick = () => {
      mode = b.dataset.rjMode;
      render();
    });
  }
  function addCover(el) {
    el.insertAdjacentHTML(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 258), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 259) + __MARKET_STRUCTURE_RUNTIME__.template(card(...definitions.cash[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 260)])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 261) + __MARKET_STRUCTURE_RUNTIME__.template(card(...definitions.options[__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 262)])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 263));
    bind(el);
  }
  function controls() {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 264) + __MARKET_STRUCTURE_RUNTIME__.template(mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 265) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 266) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 267)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 268) + __MARKET_STRUCTURE_RUNTIME__.template(mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 269) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 270) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 271)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 272);
  }
  const panel = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 273));
  panel.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 274);
  panel.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 275);
  panel.hidden = true;
  document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 276)).before(panel);
  function render() {
    const ticker = state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 277) ? state.company : null, defs = ticker ? company[ticker] : definitions[category];
    if (contextMode && window.MarketContext) {
      window.MarketContext.render(panel, ticker);
      return;
    }
    panel.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 278) + __MARKET_STRUCTURE_RUNTIME__.template(ticker ? E(ticker) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 279) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 280)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 281) + __MARKET_STRUCTURE_RUNTIME__.template(!ticker ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 282) + __MARKET_STRUCTURE_RUNTIME__.template(Object.keys(definitions).map(k => __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 283) + __MARKET_STRUCTURE_RUNTIME__.template(k) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 284) + __MARKET_STRUCTURE_RUNTIME__.template(category === k ? __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 285) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 286)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 287) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.data[k].sheet)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 288)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 289))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 290) : __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 291)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 292) + __MARKET_STRUCTURE_RUNTIME__.template(controls()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 293) + __MARKET_STRUCTURE_RUNTIME__.template(defs.map(d => card(...d, mode)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 294))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 295) + __MARKET_STRUCTURE_RUNTIME__.template(D.import_date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 296) + __MARKET_STRUCTURE_RUNTIME__.template(D.audit.duplicate_dates_quarantined.length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 297) + __MARKET_STRUCTURE_RUNTIME__.template(D.audit.invalid_cells_quarantined.length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 298) + __MARKET_STRUCTURE_RUNTIME__.template(D.audit.error_cells_excluded.length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 299);
    bind(panel);
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 300)).onclick = () => {
      contextMode = true;
      render();
    };
    const sel = document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 301));
    if (sel) sel.onchange = () => {
      category = sel.value;
      render();
    };
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 302)).onclick = () => save(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 303), JSON.stringify(D, null, __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 304)), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 305));
  }
  const btn = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 306));
  btn.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 307);
  btn.dataset.tab = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 308);
  btn.textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 309);
  btn.onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 310));
  document.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 311)).appendChild(btn);
  const nav = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 312));
  nav.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 313);
  nav.textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 314);
  nav.onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 315));
  document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 316)).appendChild(nav);
  const old = setTab;
  setTab = function (t) {
    old(t);
    panel.hidden = ![__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 317), __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 318)].includes(t);
    if (!panel.hidden) {
      document.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-020", 319)).hidden = t === __MARKET_STRUCTURE_RUNTIME__.literal("module-020", 320);
      render();
    }
  };
  window.RJMarket = {
    setContext: v => {
      contextMode = v;
      render();
    },
    data: D,
    card,
    render,
    addCover,
    exports,
    rowsFor,
    point,
    csv,
    setMode: p => {
      mode = p;
    },
    setCategory: k => {
      category = k;
    },
    definitions,
    company
  };
  C.coverRender();
})();
