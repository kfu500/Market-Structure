// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  "use strict";
  const D = DB.market_context, C = window.MarketChartCover, E = x => String(x ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 0)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 1), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 2)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 3)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 4),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 5)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 6),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 7)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 8),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 9)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 10),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 11)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 12)
  })[c]);
  if (!D) return;
  let frequency = __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 13), years = __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 14), view = __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 15);
  const exports = new Map();
  const company = {
    CME: [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 16), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 17), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 18), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 19), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 20), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 21), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 22)],
    ICE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 23), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 24), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 25), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 26), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 27)],
    CBOE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 28), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 29), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 30), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 31)],
    NDAQ: [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 32), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 33), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 34), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 35)],
    TW: [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 36), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 37), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 38), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 39), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 40), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 41), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 42), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 43)],
    HOOD: [__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 44), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 45), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 46), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 47)]
  };
  const relevance = {
    CME: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 48),
    ICE: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 49),
    CBOE: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 50),
    NDAQ: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 51),
    TW: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 52),
    HOOD: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 53)
  };
  function rows(key, section = __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 54)) {
    const s = D.series[key], src = D.source;
    return s[section].map((r, i) => ({
      observation_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 55) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 56) + __MARKET_STRUCTURE_RUNTIME__.template(section) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 57) + __MARKET_STRUCTURE_RUNTIME__.template(i) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 58),
      company_or_venue: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 59),
      metric_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 60) + key,
      metric: s.title,
      period: r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 61)],
      as_of: section === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 62) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 63) : r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 64)],
      frequency: section === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 65) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 66) : s.frequency,
      value: r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 67)],
      unit: s.unit,
      measure_type: s.measure_type,
      status: section === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 68) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 69) : s.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 70) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 71) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 72),
      role: section === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 73) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 74) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 75),
      source_document: src.file_name,
      source_location: s.sheet + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 76) + s.column + r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 77)],
      source_url: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 78),
      retrieved_at: src.retrieved_at,
      scope: s.scope,
      source_record: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 79) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 80) + __MARKET_STRUCTURE_RUNTIME__.template(section) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 81) + __MARKET_STRUCTURE_RUNTIME__.template(i) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 82) + __MARKET_STRUCTURE_RUNTIME__.template(src.sha256) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 83)
    }));
  }
  function* observations() {
    for (const key of Object.keys(D.series)) {
      yield* rows(key);
      yield* rows(key, __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 84));
    }
  }
  function values(key) {
    const s = D.series[key], by = new Map(s.points.map(r => [r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 85)].slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 86), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 87)), r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 88)]]));
    return s.points.map(r => {
      const prior = by.get(+r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 89)].slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 90), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 91)) - __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 92) + r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 93)].slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 94), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 95)));
      return {
        date: r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 96)],
        raw: r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 97)],
        value: view === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 98) ? prior > __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 99) ? (r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 100)] / prior - __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 101)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 102) : null : r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 103)]
      };
    });
  }
  function card(key) {
    const s = D.series[key], daily = s.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 104), last = s.points.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 105)), all = values(key), end = new Date(last[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 106)] + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 107));
    end.setUTCFullYear(end.getUTCFullYear() - years);
    let pts = all.filter(r => !years || r.date >= end.toISOString().slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 108), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 109)));
    const by = new Map(pts.map(r => [r.date, r]));
    if (pts.length && !daily) {
      const a = new Date(pts[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 110)].date + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 111)), b = new Date(pts.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 112)).date + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 113)), full = [];
      for (let y = a.getUTCFullYear(), m = a.getUTCMonth(); y < b.getUTCFullYear() || y === b.getUTCFullYear() && m <= b.getUTCMonth(); ) {
        const d = new Date(Date.UTC(y, m + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 114), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 115))).toISOString().slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 116), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 117));
        full.push(by.get(d) || ({
          date: d,
          value: null
        }));
        if (++m === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 118)) {
          m = __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 119);
          y++;
        }
      }
      pts = full;
    }
    const scale = view === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 120) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 121) : s.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 122) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 123) : s.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 124) || s.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 125) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 126) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 127);
    const unit = view === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 128) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 129) : s.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 130) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 131) : s.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 132) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 133) : s.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 134) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 135) : s.unit;
    const latest = pts.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 136)), v = latest?.value, fmt = n => n == null ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 137) : (n / scale).toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 138), {
      maximumFractionDigits: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 139)
    });
    exports.set(key, rows(key).map((r, i) => ({
      ...r,
      display_value: all[i].value == null ? null : all[i].value / scale,
      display_unit: unit,
      view
    })));
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 140) + __MARKET_STRUCTURE_RUNTIME__.template(daily ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 141) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 142)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 143) + __MARKET_STRUCTURE_RUNTIME__.template(E(s.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 144) + __MARKET_STRUCTURE_RUNTIME__.template(E(fmt(v))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 145) + __MARKET_STRUCTURE_RUNTIME__.template(E(unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 146) + __MARKET_STRUCTURE_RUNTIME__.template(E(last[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 147)])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 148) + __MARKET_STRUCTURE_RUNTIME__.template(daily ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 149) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 150)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 151) + __MARKET_STRUCTURE_RUNTIME__.template(C.graph(pts.map(r => r.date), [{
      name: s.title,
      values: pts.map(r => r.value == null ? null : r.value / scale),
      color: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 152)
    }], {
      unit,
      title: s.title
    })) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 153) + __MARKET_STRUCTURE_RUNTIME__.template(E(s.scope)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 154) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.source.cover_date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 155) + __MARKET_STRUCTURE_RUNTIME__.template(E(s.sheet)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 156) + __MARKET_STRUCTURE_RUNTIME__.template(E(s.column)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 157) + __MARKET_STRUCTURE_RUNTIME__.template(E(s.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 158) + __MARKET_STRUCTURE_RUNTIME__.template(daily ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 159) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 160)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 161) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.source.file_name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 162) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.source.sha256)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 163) + __MARKET_STRUCTURE_RUNTIME__.template(E(key)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 164);
  }
  function render(panel, ticker) {
    const keys = (ticker ? company[ticker] : Object.keys(D.series)).filter(k => frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 165) ? D.series[k].frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 166) : D.series[k].frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 167));
    panel.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 168) + __MARKET_STRUCTURE_RUNTIME__.template(ticker ? E(ticker) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 169) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 170)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 171) + __MARKET_STRUCTURE_RUNTIME__.template(E(ticker ? relevance[ticker] : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 172))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 173) + __MARKET_STRUCTURE_RUNTIME__.template(frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 174) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 175) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 176)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 177) + __MARKET_STRUCTURE_RUNTIME__.template(frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 178) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 179) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 180)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 181) + __MARKET_STRUCTURE_RUNTIME__.template(years === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 182) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 183) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 184)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 185) + __MARKET_STRUCTURE_RUNTIME__.template(years === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 186) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 187) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 188)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 189) + __MARKET_STRUCTURE_RUNTIME__.template(years === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 190) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 191) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 192)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 193) + __MARKET_STRUCTURE_RUNTIME__.template(view === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 194) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 195) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 196)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 197) + __MARKET_STRUCTURE_RUNTIME__.template(frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 198) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 199) + (view === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 200) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 201) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 202)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 203) : __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 204)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 205) + __MARKET_STRUCTURE_RUNTIME__.template(keys.map(card).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 206))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 207) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.source.cover_date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 208) + __MARKET_STRUCTURE_RUNTIME__.template((ticker ? company[ticker] : Object.keys(D.series)).flatMap(k => D.series[k].partial.map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 209) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.series[k].title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 210) + __MARKET_STRUCTURE_RUNTIME__.template(r[__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 211)].toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 212), {
      maximumFractionDigits: __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 213)
    })) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 214) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.series[k].unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 215))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 216))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 217) + __MARKET_STRUCTURE_RUNTIME__.template(D.audit.missing_cells) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 218) + __MARKET_STRUCTURE_RUNTIME__.template(D.audit.quarantined.length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 219) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.audit.excluded_fields.join(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 220)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 221);
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 222)).onclick = () => window.RJMarket.setContext(false);
    panel.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 223)).forEach(b => b.onclick = () => {
      frequency = b.dataset.contextFrequency;
      if (frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 224)) view = __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 225);
      render(panel, ticker);
    });
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 226)).onchange = e => {
      years = +e.target.value;
      render(panel, ticker);
    };
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 227)).onchange = e => {
      view = e.target.value;
      render(panel, ticker);
    };
    panel.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 228)).forEach(b => b.onclick = () => download(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 229) + b.dataset.contextExport + __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 230), window.PortalData.csvRows(exports.get(b.dataset.contextExport), [...window.PortalData.columns, __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 231), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 232), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 233)]), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 234)));
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 235)).onclick = () => download(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 236), [JSON.stringify(D)], __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 237));
  }
  function download(name, parts, type) {
    const u = URL.createObjectURL(new Blob(parts, {
      type
    })), a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-022", 238));
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 239));
  }
  window.MarketContext = {
    data: D,
    render,
    observations,
    rows,
    values,
    card,
    exports,
    company,
    setFrequency: f => {
      frequency = f;
      if (f === __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 240)) view = __MARKET_STRUCTURE_RUNTIME__.literal("module-022", 241);
    },
    setView: v => {
      view = v;
    },
    setYears: n => {
      years = n;
    }
  };
})();
