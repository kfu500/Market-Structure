// Reviewed presentation code; literal content is supplied by private storage.
window.Consensus = (() => {
  "use strict";
  const data = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 0)).textContent);
  const n = v => typeof v === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1) && Number.isFinite(v);
  const e = v => String(v ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 2)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 3), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 4)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 5)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 6),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 7)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 8),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 9)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 10),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 11)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 12),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 13)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 14)
  })[c]);
  const byId = id => document.getElementById(id);
  const units = {
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 15)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 16),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 17)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 18),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 19)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 20),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 21)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 22),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 23)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 24),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 25)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 26),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 27)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 28),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 29)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 30),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 31)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 32)
  };
  const ui = {
    company: null,
    kind: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 33),
    period: null,
    metric: null,
    view: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 34),
    range: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 35),
    pace: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 36)
  };
  const scenarios = new Map();
  const scenarioKey = () => [ui.company, ui.period, ui.metric].join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 37));
  const unit = m => units[m.unit] || m.unit;
  const format = (v, m, small = false) => !n(v) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 38) : v.toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 39), {
    maximumFractionDigits: small ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 40) : m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 41) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 42) : m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 43) || m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 44) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 45) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 46)
  }) + (m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 47) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 48) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 49));
  const signed = (v, suffix = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 50)) => !n(v) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 51) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 52) + __MARKET_STRUCTURE_RUNTIME__.template(v >= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 53) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 54) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 55)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 56) + __MARKET_STRUCTURE_RUNTIME__.template(v.toFixed(Math.abs(v) > __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 57) && Math.abs(v) < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 58) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 59) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 60))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 61) + __MARKET_STRUCTURE_RUNTIME__.template(suffix) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 62);
  const value = (co, m, p) => {
    const i = co.periods.findIndex(x => x.id === p.id);
    return i < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 63) ? null : m.values[i]?.[p.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 64) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 65) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 66)] ?? null;
  };
  const provenance = (co, m, p, channel = p.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 67) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 68) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 69)) => {
    const i = co.periods.findIndex(x => x.id === p.id);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 70) + __MARKET_STRUCTURE_RUNTIME__.template(ui.company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 71) + __MARKET_STRUCTURE_RUNTIME__.template(p.columns[channel]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 72) + __MARKET_STRUCTURE_RUNTIME__.template(m.cell_rows?.[i + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 73) + channel] || m.row) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 74);
  };
  const growth = (co, m, p) => {
    const prior = co.periods.find(x => x.year === p.year - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 75) && x.kind === p.kind && x.quarter === p.quarter);
    const a = value(co, m, p), b = prior ? value(co, m, prior) : null;
    return {
      prior,
      base: b,
      value: !n(a) || !n(b) ? null : m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 76) ? a - b : b > __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 77) ? (a / b - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 78)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 79) : null,
      pp: m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 80)
    };
  };
  function gap(a, b, m) {
    return !n(a) || !n(b) ? null : m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 81) ? a - b : b > __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 82) ? (a / b - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 83)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 84) : null;
  }
  function forecastPeriods(co) {
    return co.periods.filter(p => p.kind === ui.kind && p.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 85));
  }
  function init(ticker) {
    const co = data.companies[ticker];
    if (ui.company !== ticker) {
      ui.kind = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 86);
      ui.period = null;
      ui.company = ticker;
      ui.metric = pref[ticker]?.find(id => co.metrics[id]) || Object.keys(co.metrics)[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 87)];
    }
    const ps = forecastPeriods(co);
    if (!ps.some(p => p.id === ui.period)) {
      const current = data.as_of.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 88), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 89)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 90) + Math.ceil(+data.as_of.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 91), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 92)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 93));
      ui.period = ps.find(p => p.id === current)?.id || ps[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 94)]?.id;
    }
    return co;
  }
  function points(co, m) {
    const cutoff = +data.as_of.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 95), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 96));
    return co.periods.filter(p => p.kind === ui.kind && (ui.range === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 97) || p.year >= cutoff - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 98) && p.year <= cutoff + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 99))).map(p => ({
      p,
      v: ui.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 100) ? growth(co, m, p).value : value(co, m, p)
    }));
  }
  function lineChart(co, m) {
    const rows = points(co, m), defined = rows.filter(r => n(r.v));
    if (!defined.length) return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 101);
    const w = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 102), h = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 103), l = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 104), r = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 105), t = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 106), b = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 107);
    const sc = scenarios.get(scenarioKey());
    const scenario = ui.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 108) && n(sc) && rows.some(x => x.p.id === ui.period) ? sc : null;
    let lo = Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 109), ...defined.map(x => x.v), ...n(scenario) ? [scenario] : []), hi = Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 110), ...defined.map(x => x.v), ...n(scenario) ? [scenario] : []);
    if (hi === lo) hi = lo + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 111);
    const pad = (hi - lo) * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 112);
    hi += pad;
    if (lo < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 113)) lo -= pad;
    const x = i => l + (w - l - r) * (rows.length === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 114) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 115) : i / (rows.length - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 116))), y = v => h - b - (h - t - b) * (v - lo) / (hi - lo);
    const yu = ui.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 117) ? m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 118) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 119) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 120) : unit(m);
    let svg = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 121) + __MARKET_STRUCTURE_RUNTIME__.template(w) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 122) + __MARKET_STRUCTURE_RUNTIME__.template(h) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 123) + __MARKET_STRUCTURE_RUNTIME__.template(e(m.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 124) + __MARKET_STRUCTURE_RUNTIME__.template(l) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 125) + __MARKET_STRUCTURE_RUNTIME__.template(e(yu)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 126);
    const firstForecast = rows.findIndex(o => o.p.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 127));
    if (firstForecast >= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 128)) {
      const start = firstForecast ? Math.max(l, (x(firstForecast - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 129)) + x(firstForecast)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 130)) : l;
      svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 131) + __MARKET_STRUCTURE_RUNTIME__.template(start) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 132) + __MARKET_STRUCTURE_RUNTIME__.template(t) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 133) + __MARKET_STRUCTURE_RUNTIME__.template(w - r - start) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 134) + __MARKET_STRUCTURE_RUNTIME__.template(h - t - b) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 135) + __MARKET_STRUCTURE_RUNTIME__.template(w - r - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 136)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 137) + __MARKET_STRUCTURE_RUNTIME__.template(t + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 138)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 139);
    }
    for (let i = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 140); i < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 141); i++) {
      const v = lo + (hi - lo) * i / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 142);
      svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 143) + __MARKET_STRUCTURE_RUNTIME__.template(l) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 144) + __MARKET_STRUCTURE_RUNTIME__.template(w - r) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 145) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 146) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 147) + __MARKET_STRUCTURE_RUNTIME__.template(l - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 148)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 149) + __MARKET_STRUCTURE_RUNTIME__.template(y(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 150)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 151) + __MARKET_STRUCTURE_RUNTIME__.template(e(ui.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 152) ? v.toFixed(Math.abs(v) > __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 153) && Math.abs(v) < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 154) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 155) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 156)) : format(v, m, true))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 157);
    }
    const actual = [], estimate = [];
    rows.forEach((o, i) => {
      const last = rows[i - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 158)];
      if (n(o.v) && n(last?.v)) {
        const contiguous = o.p.year * (ui.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 159) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 160) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 161)) + (o.p.quarter || __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 162)) - (last.p.year * (ui.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 163) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 164) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 165)) + (last.p.quarter || __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 166))) === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 167);
        if (contiguous) (o.p.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 168) ? estimate : actual).push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 169) + __MARKET_STRUCTURE_RUNTIME__.template(x(i - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 170))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 171) + __MARKET_STRUCTURE_RUNTIME__.template(y(last.v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 172) + __MARKET_STRUCTURE_RUNTIME__.template(x(i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 173) + __MARKET_STRUCTURE_RUNTIME__.template(y(o.v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 174));
      }
    });
    svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 175) + __MARKET_STRUCTURE_RUNTIME__.template(actual.join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 176))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 177) + __MARKET_STRUCTURE_RUNTIME__.template(estimate.join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 178))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 179);
    const labelCount = Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 180), rows.length), labelIndices = new Set(Array.from({
      length: labelCount
    }, (_, i) => Math.round(i * (rows.length - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 181)) / Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 182), labelCount - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 183)))));
    rows.forEach((o, i) => {
      if (labelIndices.has(i)) svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 184) + __MARKET_STRUCTURE_RUNTIME__.template(x(i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 185) + __MARKET_STRUCTURE_RUNTIME__.template(h - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 186)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 187) + __MARKET_STRUCTURE_RUNTIME__.template(e(o.p.label.replace(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 188), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 189)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 190);
      if (n(o.v)) svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 191) + __MARKET_STRUCTURE_RUNTIME__.template(x(i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 192) + __MARKET_STRUCTURE_RUNTIME__.template(y(o.v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 193) + __MARKET_STRUCTURE_RUNTIME__.template(o.p.id === ui.period ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 194) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 195)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 196) + __MARKET_STRUCTURE_RUNTIME__.template(o.p.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 197) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 198) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 199)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 200) + __MARKET_STRUCTURE_RUNTIME__.template(e(o.p.label + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 201) + (o.p.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 202) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 203) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 204)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 205) + (ui.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 206) ? signed(o.v, m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 207) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 208) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 209)) : format(o.v, m) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 210) + unit(m)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 211) + provenance(co, m, o.p))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 212);
    });
    if (n(scenario)) {
      const i = rows.findIndex(o => o.p.id === ui.period);
      svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 213) + __MARKET_STRUCTURE_RUNTIME__.template(x(i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 214) + __MARKET_STRUCTURE_RUNTIME__.template(y(scenario) - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 215)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 216) + __MARKET_STRUCTURE_RUNTIME__.template(e(format(scenario, m))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 217);
    }
    return svg + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 218);
  }
  const focus = data.focus;
  const pref = Object.fromEntries(Object.entries(focus.companies).map(([t, f]) => [t, [...new Set([f.revenue, f.eps, ...f.metrics.map(x => x[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 219)])])]]));
  const fmt = (v, d = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 220)) => n(v) ? v.toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 221), {
    maximumFractionDigits: d
  }) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 222);
  const dateLabel = d => new Date(d + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 223)).toLocaleDateString(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 224), {
    day: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 225),
    month: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 226),
    timeZone: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 227)
  });
  const monthEnd = d => new Date(Date.UTC(+d.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 228), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 229)), +d.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 230), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 231)), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 232))).toISOString().slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 233), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 234));
  const quarterOf = d => d.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 235), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 236)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 237) + Math.ceil(+d.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 238), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 239)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 240));
  const link = (url, label) => __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 241) + __MARKET_STRUCTURE_RUNTIME__.template(e(url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 242) + __MARKET_STRUCTURE_RUNTIME__.template(e(label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 243);
  const safeCalc = (observed, observedDays, totalDays, target, remainingPace, total = false) => {
    if (![observed, observedDays, totalDays, target, remainingPace].every(n) || observed < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 244) || observedDays <= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 245) || totalDays < observedDays || target < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 246) || remainingPace < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 247)) return {
      required: null,
      projection: null,
      remaining: null,
      covered: false
    };
    const remaining = totalDays - observedDays, desired = total ? target : target * totalDays;
    return {
      required: remaining > __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 248) ? Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 249), (desired - observed) / remaining) : null,
      projection: total ? observed + remaining * remainingPace : (observed + remaining * remainingPace) / totalDays,
      remaining,
      covered: observed >= desired
    };
  };
  function monthParts(ticker, key, p, allowMTD = false) {
    const series = DB.profiles[ticker].series[key] || [], parts = [];
    if (p.kind !== __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 250)) return parts;
    for (let j = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 251); j < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 252); j++) {
      const mon = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 253) + __MARKET_STRUCTURE_RUNTIME__.template(p.year) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 254) + __MARKET_STRUCTURE_RUNTIME__.template(String((p.quarter - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 255)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 256) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 257) + j).padStart(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 258), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 259))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 260);
      const r = series.find(r => r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 261), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 262)) === mon);
      if (!r || r.analysis_block || !n(r.value)) break;
      const partial = new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 263), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 264)).test(r.period_status || __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 265));
      if (partial && !(allowMTD && r.as_of && r.as_of <= (DB.refresh.checked_at || data.as_of).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 266), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 267)) && n(r.days) && r.days > __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 268))) break;
      parts.push({
        ...r,
        cutoff: partial ? r.as_of : monthEnd(r.date),
        partial
      });
      if (partial) break;
    }
    return parts;
  }
  function sourceRefs(parts) {
    return parts.map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 269) + __MARKET_STRUCTURE_RUNTIME__.template(r.source_document) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 270) + __MARKET_STRUCTURE_RUNTIME__.template(r.source_location) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 271) + __MARKET_STRUCTURE_RUNTIME__.template(r.cutoff) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 272));
  }
  function latestPrint(ticker, key) {
    const tables = DB.refresh?.companies?.[ticker]?.tables || [];
    if (ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 273)) {
      const t = tables.find(t => t.rows?.some(r => r.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 274) && n(r.futures))), name = ({
        [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 275)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 276),
        [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 277)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 278),
        [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 279)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 280),
        [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 281)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 282),
        [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 283)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 284),
        [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 285)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 286)
      })[key], r = t?.rows.find(r => r.metric === name);
      return r && t.as_of <= (DB.refresh.checked_at || data.as_of).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 287), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 288)) ? {
        value: r.volume / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 289),
        label: dateLabel(t.as_of) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 290),
        source: t.sources?.[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 291)]?.title
      } : null;
    }
    if (ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 292) && key === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 293)) {
      const t = tables.find(t => t.rows?.some(r => r.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 294))), r = t?.rows.find(r => r.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 295));
      return r && t.as_of <= (DB.refresh.checked_at || data.as_of).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 296), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 297)) ? {
        value: r.volume / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 298),
        label: dateLabel(t.as_of) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 299),
        source: t.sources?.[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 300)]?.title
      } : null;
    }
    return null;
  }
  const advMap = {
    CME: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 301), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 302), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 303), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 304), null], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 305), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 306), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 307), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 308), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 309)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 310), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 311), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 312), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 313), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 314)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 315), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 316), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 317), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 318), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 319)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 320), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 321), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 322), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 323), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 324)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 325), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 326), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 327), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 328), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 329)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 330), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 331), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 332), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 333), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 334)]],
    CBOE: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 335), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 336), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 337), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 338), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 339)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 340), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 341), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 342), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 343), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 344)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 345), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 346), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 347), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 348), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 349)]],
    NDAQ: [[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 350), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 351), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 352), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 353), null]]
  };
  function pacing(ticker, co, p) {
    if (p.kind !== __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 354) || p.status !== __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 355)) return [];
    const rows = [];
    for (const [id, key, factor, label, rpc] of advMap[ticker] || []) {
      const m = co.metrics[id], parts = monthParts(ticker, key, p, ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 356) || ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 357) && DB.profiles.CME.series[key]?.some(r => r.coverage_verified === true && r.scope === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 358))), target = m ? value(co, m, p) : null;
      if (!m || !n(target) || !parts.length || parts.some(r => !n(r.days) || r.days <= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 359))) continue;
      const days = parts.reduce((s, r) => s + r.days, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 360)), observed = parts.reduce((s, r) => s + r.value * r.days * factor, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 361)), last = parts.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 362));
      const pace = observed / days, base = ui.pace === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 363) ? pace : last.value * factor;
      const totalDays = p.id === focus.calendar.quarter && !(ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 364) && key === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 365)) ? focus.calendar.days : null;
      const calc = safeCalc(observed, days, totalDays, target, base);
      rows.push({
        id,
        key,
        label,
        rpc,
        target,
        pace,
        observed,
        days,
        totalDays,
        base,
        ...calc,
        gap: gap(calc.projection, target, m),
        paceGap: gap(pace, target, m),
        months: parts.length,
        through: last.cutoff,
        from: parts[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 366)].date,
        factor,
        mode: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 367),
        unit: ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 368) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 369) : ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 370) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 371) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 372),
        baseLabel: ui.pace === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 373) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 374) : last.partial ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 375) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 376),
        sources: sourceRefs(parts),
        latest: latestPrint(ticker, key),
        consensus_cell: provenanceFor(ticker, co, m, p),
        rateUnit: ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 377) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 378) : ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 379) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 380) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 381)
      });
    }
    if (ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 382)) {
      const maps = [[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 383), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 384), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 385), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 386), true], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 387), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 388), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 389), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 390), false], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 391), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 392), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 393), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 394), true], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 395), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 396), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 397), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 398), true], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 399), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 400), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 401), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 402), false]];
      for (const [id, key, label, u, calendar] of maps) {
        const m = co.metrics[id], parts = monthParts(ticker, key, p), target = m ? value(co, m, p) : null;
        if (!m || !n(target) || !parts.length || p.id !== focus.calendar.quarter) continue;
        const dayFor = r => calendar ? +monthEnd(r.date).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 403)) : focus.calendar.month_days[(+r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 404), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 405)) - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 406)) % __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 407)];
        const days = parts.reduce((s, r) => s + dayFor(r), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 408)), observed = parts.reduce((s, r) => s + r.value, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 409)), last = parts.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 410)), pace = observed / days;
        const base = ui.pace === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 411) ? pace : last.value / dayFor(last), totalDays = calendar ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 412) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 413), calc = safeCalc(observed, days, totalDays, target, base, true);
        rows.push({
          id,
          key,
          label,
          target,
          pace,
          observed,
          days,
          totalDays,
          base,
          ...calc,
          gap: gap(calc.projection, target, m),
          paceGap: null,
          months: parts.length,
          through: last.cutoff,
          from: parts[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 414)].date,
          mode: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 415),
          unit: u === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 416) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 417) : u === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 418) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 419) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 420),
          rateUnit: u === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 421) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 422) : u === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 423) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 424) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 425),
          calendar,
          baseLabel: ui.pace === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 426) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 427) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 428),
          sources: sourceRefs(parts),
          consensus_cell: provenanceFor(ticker, co, m, p)
        });
      }
    }
    if (ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 429)) {
      const tables = DB.refresh?.companies?.ICE?.tables || [], tb = tables.find(t => t.rows?.some(r => r.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 430) && n(r.qtd_adv)) && new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 431), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 432)).test(t.title)), r = tb?.rows.find(r => r.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 433)), id = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 434), m = co.metrics[id];
      if (r && tb.as_of <= (DB.refresh.checked_at || data.as_of).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 435), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 436)) && quarterOf(tb.as_of) === p.id && m) {
        const pace = r.qtd_adv * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 437), target = value(co, m, p);
        rows.push({
          id,
          key: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 438),
          label: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 439),
          target,
          pace,
          observed: null,
          days: null,
          totalDays: null,
          base: null,
          required: null,
          projection: null,
          gap: null,
          paceGap: gap(pace, target, m),
          through: tb.as_of,
          mode: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 440),
          unit: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 441),
          rateUnit: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 442),
          sources: tb.sources.map(s => s.title + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 443) + s.location),
          consensus_cell: provenanceFor(ticker, co, m, p),
          latest: {
            value: r.mtd_adv * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 444),
            label: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 445) + dateLabel(tb.as_of)
          }
        });
      }
    }
    if (ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 446)) {
      for (const [id, key, label] of [[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 447), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 448), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 449)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 450), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 451), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 452)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 453), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 454), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 455)]]) {
        const parts = monthParts(ticker, key, p), m = co.metrics[id], last = parts.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 456));
        if (!last || !m) continue;
        const target = value(co, m, p);
        rows.push({
          id,
          key,
          label,
          target,
          pace: last.value,
          observed: null,
          days: null,
          totalDays: null,
          base: null,
          required: null,
          projection: null,
          gap: null,
          paceGap: gap(last.value, target, m),
          through: last.cutoff,
          mode: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 457),
          unit: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 458),
          rateUnit: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 459),
          sources: sourceRefs([last]),
          consensus_cell: provenanceFor(ticker, co, m, p)
        });
      }
    }
    return rows;
  }
  function provenanceFor(t, co, m, p) {
    const i = co.periods.findIndex(x => x.id === p.id), ch = p.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 460) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 461) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 462);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 463) + __MARKET_STRUCTURE_RUNTIME__.template(t) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 464) + __MARKET_STRUCTURE_RUNTIME__.template(p.columns[ch]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 465) + __MARKET_STRUCTURE_RUNTIME__.template(m.cell_rows?.[i + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 466) + ch] || m.row) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 467);
  }
  function gapChart(rows) {
    const w = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 468), l = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 469), mid = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 470), h = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 471) + rows.length * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 472), max = Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 473), ...rows.map(r => Math.abs((r.gap ?? r.paceGap) ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 474)))) * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 475), scale = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 476) / max;
    let svg = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 477) + __MARKET_STRUCTURE_RUNTIME__.template(w) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 478) + __MARKET_STRUCTURE_RUNTIME__.template(h) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 479) + __MARKET_STRUCTURE_RUNTIME__.template(mid) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 480) + __MARKET_STRUCTURE_RUNTIME__.template(mid) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 481) + __MARKET_STRUCTURE_RUNTIME__.template(mid) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 482) + __MARKET_STRUCTURE_RUNTIME__.template(h - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 483)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 484);
    rows.forEach((r, i) => {
      const v = r.gap ?? r.paceGap, y = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 485) + i * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 486);
      if (!n(v)) return;
      const len = Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 487), Math.abs(v) * scale);
      svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 488) + __MARKET_STRUCTURE_RUNTIME__.template(y + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 489)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 490) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 491) + __MARKET_STRUCTURE_RUNTIME__.template(v >= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 492) ? mid : mid - len) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 493) + __MARKET_STRUCTURE_RUNTIME__.template(y - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 494)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 495) + __MARKET_STRUCTURE_RUNTIME__.template(len) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 496) + __MARKET_STRUCTURE_RUNTIME__.template(v >= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 497) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 498) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 499)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 500) + __MARKET_STRUCTURE_RUNTIME__.template(n(r.projection) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 501) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 502)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 503) + __MARKET_STRUCTURE_RUNTIME__.template(w - __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 504)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 505) + __MARKET_STRUCTURE_RUNTIME__.template(y + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 506)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 507) + __MARKET_STRUCTURE_RUNTIME__.template(signed(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 508);
    });
    return svg + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 509);
  }
  function paceRows(rows) {
    return rows.map(r => {
      const observed = r.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 510) ? r.observed : r.pace;
      const window = r.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 511) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 512) : r.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 513) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 514) : r.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 515) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 516) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 517);
      const basis = r.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 518) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 519) : r.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 520) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 521) : n(r.projection) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 522) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 523);
      const scaledRate = r.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 524) && (r.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 525) || r.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 526) && r.required < __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 527));
      const need = n(r.required) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 528) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(scaledRate ? r.required * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 529) : r.required, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 530))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 531) + __MARKET_STRUCTURE_RUNTIME__.template(e(scaledRate ? r.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 532) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 533) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 534) : r.rateUnit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 535) + __MARKET_STRUCTURE_RUNTIME__.template(r.remaining) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 536) + __MARKET_STRUCTURE_RUNTIME__.template(r.calendar ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 537) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 538)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 539) + __MARKET_STRUCTURE_RUNTIME__.template(r.covered ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 540) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 541)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 542) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 543);
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 544) + __MARKET_STRUCTURE_RUNTIME__.template(r.id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 545) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 546) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 547) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(observed, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 548))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 549) + __MARKET_STRUCTURE_RUNTIME__.template(window) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 550) + __MARKET_STRUCTURE_RUNTIME__.template(dateLabel(r.through)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 551) + __MARKET_STRUCTURE_RUNTIME__.template(r.latest ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 552) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(r.latest.value, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 553))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 554) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.latest.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 555) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 556)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 557) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(r.target, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 558))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 559) + __MARKET_STRUCTURE_RUNTIME__.template(need) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 560) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(r.projection, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 561))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 562) + __MARKET_STRUCTURE_RUNTIME__.template(n(r.projection) ? e(r.baseLabel) : r.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 563) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 564) : r.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 565) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 566) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 567)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 568) + __MARKET_STRUCTURE_RUNTIME__.template(signed(r.gap ?? r.paceGap)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 569) + __MARKET_STRUCTURE_RUNTIME__.template(basis) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 570);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 571));
  }
  function trackingHTML(co, p) {
    if (p.kind !== __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 572)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 573);
    const rows = pacing(ui.company, co, p);
    if (!rows.length) return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 574) + __MARKET_STRUCTURE_RUNTIME__.template(e(p.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 575);
    const primary = ui.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 576) ? rows.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 577), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 578)) : rows;
    const table = rs => __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 579) + __MARKET_STRUCTURE_RUNTIME__.template(e(p.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 580) + __MARKET_STRUCTURE_RUNTIME__.template(paceRows(rs)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 581);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 582) + __MARKET_STRUCTURE_RUNTIME__.template(rows.some(r => n(r.projection)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 583) + __MARKET_STRUCTURE_RUNTIME__.template(ui.pace === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 584) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 585) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 586)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 587) + __MARKET_STRUCTURE_RUNTIME__.template(ui.pace === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 588) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 589) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 590)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 591) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 592)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 593) + __MARKET_STRUCTURE_RUNTIME__.template(e(focus.companies[ui.company].reason)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 594) + __MARKET_STRUCTURE_RUNTIME__.template(table(primary)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 595) + __MARKET_STRUCTURE_RUNTIME__.template(rows.length > primary.length ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 596) + __MARKET_STRUCTURE_RUNTIME__.template(table(rows.slice(primary.length))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 597) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 598)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 599) + __MARKET_STRUCTURE_RUNTIME__.template(gapChart(primary)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 600) + __MARKET_STRUCTURE_RUNTIME__.template(link(focus.calendar.sources.CME, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 601))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 602) + __MARKET_STRUCTURE_RUNTIME__.template(link(focus.calendar.sources.CBOE, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 603))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 604) + __MARKET_STRUCTURE_RUNTIME__.template(link(focus.calendar.sources.NDAQ, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 605))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 606) + __MARKET_STRUCTURE_RUNTIME__.template(rows.map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 607) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 608) + __MARKET_STRUCTURE_RUNTIME__.template(r.days ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 609)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 610) + __MARKET_STRUCTURE_RUNTIME__.template(r.through) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 611) + __MARKET_STRUCTURE_RUNTIME__.template(r.sources.map(e).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 612))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 613) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.consensus_cell)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 614) + __MARKET_STRUCTURE_RUNTIME__.template(r.latest ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 615) + e(r.latest.source || r.latest.label) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 616) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 617)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 618)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 619))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 620);
  }
  function bridge(ticker, co, p) {
    const rows = pacing(ticker, co, p), items = [];
    if (ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 621)) for (const r of rows.filter(r => r.rpc && n(r.projection))) {
      const m = co.metrics[r.rpc], fee = value(co, m, p);
      if (n(fee)) items.push({
        label: r.label,
        delta: (r.projection - r.target) * r.totalDays * fee,
        synthetic: r.target * r.totalDays * fee,
        fee,
        source: provenanceFor(ticker, co, m, p)
      });
    }
    if (ticker === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 622)) {
      const r = rows.find(r => r.key === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 623)), m = co.metrics[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 624)];
      if (r && n(r.projection) && m) {
        const fee = value(co, m, p);
        if (n(fee)) items.push({
          label: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 625),
          delta: (r.projection - r.target) * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 626) * fee,
          synthetic: r.target * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 627) * fee,
          fee,
          source: provenanceFor(ticker, co, m, p)
        });
      }
    }
    return items.length ? {
      items,
      delta: items.reduce((s, r) => s + r.delta, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 628)),
      synthetic: items.reduce((s, r) => s + r.synthetic, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 629))
    } : null;
  }
  const bridgeInputs = new Map();
  function epsSensitivity(revenue, flow, tax, shares) {
    return [revenue, flow, tax, shares].every(n) && flow >= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 630) && flow <= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 631) && tax >= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 632) && tax <= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 633) && shares > __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 634) ? revenue * flow / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 635) * (__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 636) - tax / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 637)) / shares : null;
  }
  function bridgeHTML(co, p) {
    const b = bridge(ui.company, co, p);
    if (!b) return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 638);
    const k = ui.company + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 639) + p.id, s = bridgeInputs.get(k) || ({}), metric = ui.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 640) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 641) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 642), street = co.metrics[metric] ? value(co, co.metrics[metric], p) : null;
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 643) + __MARKET_STRUCTURE_RUNTIME__.template(b.delta >= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 644) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 645) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 646)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 647) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(Math.abs(b.delta), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 648))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 649) + __MARKET_STRUCTURE_RUNTIME__.template(ui.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 650) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 651) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 652)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 653) + __MARKET_STRUCTURE_RUNTIME__.template(n(s.flow) ? s.flow : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 654)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 655) + __MARKET_STRUCTURE_RUNTIME__.template(n(s.tax) ? s.tax : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 656)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 657) + __MARKET_STRUCTURE_RUNTIME__.template(n(s.shares) ? s.shares : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 658)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 659) + __MARKET_STRUCTURE_RUNTIME__.template(n(epsSensitivity(b.delta, s.flow, s.tax, s.shares)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 660) + fmt(epsSensitivity(b.delta, s.flow, s.tax, s.shares), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 661)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 662)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 663) + __MARKET_STRUCTURE_RUNTIME__.template(b.items.map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 664) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 665) + __MARKET_STRUCTURE_RUNTIME__.template(r.delta >= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 666) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 667) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 668)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 669) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(r.delta, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 670))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 671) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(r.fee, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 672))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 673) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.source)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 674)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 675))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 676) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(b.synthetic, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 677))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 678) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(street, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 679))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 680) + __MARKET_STRUCTURE_RUNTIME__.template(n(street) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 681) + fmt(street - b.synthetic, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 682)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 683) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 684)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 685);
  }
  function rotheraHTML() {
    if (ui.company !== __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 686) || !window.RotheraTracker) return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 687);
    const s = window.RotheraTracker.data.summary;
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 688) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(s.latest_complete_7_day_adv / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 689), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 690))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 691) + __MARKET_STRUCTURE_RUNTIME__.template(e(s.latest_complete_7_day_window.join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 692)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 693) + __MARKET_STRUCTURE_RUNTIME__.template(signed(s[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 694)] * __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 695))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 696) + __MARKET_STRUCTURE_RUNTIME__.template(e(s.preceding_7_day_window.join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 697)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 698) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(s.september_adv_through_cutoff / __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 699), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 700))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 701) + __MARKET_STRUCTURE_RUNTIME__.template(e(s.complete_september_cutoff)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 702);
  }
  function researchHTML() {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 703);
  }
  function tableHTML(co, p) {
    const rows = focus.companies[ui.company].metrics;
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 704) + __MARKET_STRUCTURE_RUNTIME__.template(e(p.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 705) + __MARKET_STRUCTURE_RUNTIME__.template(rows.map(([id, label, reason]) => {
      const m = co.metrics[id];
      if (!m) return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 706);
      const g = growth(co, m, p);
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 707) + __MARKET_STRUCTURE_RUNTIME__.template(id === ui.metric ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 708) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 709)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 710) + __MARKET_STRUCTURE_RUNTIME__.template(id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 711) + __MARKET_STRUCTURE_RUNTIME__.template(e(label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 712) + __MARKET_STRUCTURE_RUNTIME__.template(e(unit(m))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 713) + __MARKET_STRUCTURE_RUNTIME__.template(e(provenance(co, m, p))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 714) + __MARKET_STRUCTURE_RUNTIME__.template(format(value(co, m, p), m)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 715) + __MARKET_STRUCTURE_RUNTIME__.template(signed(g.value, g.pp ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 716) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 717))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 718) + __MARKET_STRUCTURE_RUNTIME__.template(e(reason)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 719);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 720))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 721);
  }
  function scenarioHTML(co, m, p) {
    const sc = scenarios.get(scenarioKey());
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 722) + __MARKET_STRUCTURE_RUNTIME__.template(e(p.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 723) + __MARKET_STRUCTURE_RUNTIME__.template(e(unit(m))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 724) + __MARKET_STRUCTURE_RUNTIME__.template(e(m.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 725) + __MARKET_STRUCTURE_RUNTIME__.template(n(sc) ? sc : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 726)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 727) + __MARKET_STRUCTURE_RUNTIME__.template(signed(gap(sc, value(co, m, p), m), m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 728) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 729) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 730))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 731);
  }
  function revisionHTML(co, p) {
    const record = data.revision_history?.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 732));
    if (!record) return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 733);
    const changes = record.changes.filter(r => r.company === ui.company && r.period === p.id && r.channel === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 734) && r.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 735));
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 736) + __MARKET_STRUCTURE_RUNTIME__.template(e(record.from_as_of)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 737) + __MARKET_STRUCTURE_RUNTIME__.template(e(record.to_as_of)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 738) + __MARKET_STRUCTURE_RUNTIME__.template(changes.length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 739) + __MARKET_STRUCTURE_RUNTIME__.template(e(p.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 740) + __MARKET_STRUCTURE_RUNTIME__.template(changes.length ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 741) + __MARKET_STRUCTURE_RUNTIME__.template(changes.map(r => {
      const metric = co.metrics[r.metric];
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 742) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 743) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 744) + __MARKET_STRUCTURE_RUNTIME__.template(format(r.old, metric)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 745) + __MARKET_STRUCTURE_RUNTIME__.template(format(r.new, metric)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 746) + __MARKET_STRUCTURE_RUNTIME__.template(signed(gap(r.new, r.old, metric), metric.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 747) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 748) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 749))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 750) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.cell)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 751);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 752))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 753) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 754)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 755);
  }
  function sourceHTML(co, m, p) {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 756) + __MARKET_STRUCTURE_RUNTIME__.template(e(data.source_file)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 757) + __MARKET_STRUCTURE_RUNTIME__.template(e(data.as_of)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 758) + __MARKET_STRUCTURE_RUNTIME__.template(e(m.id)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 759) + __MARKET_STRUCTURE_RUNTIME__.template(e(m.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 760) + __MARKET_STRUCTURE_RUNTIME__.template(e(m.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 761) + __MARKET_STRUCTURE_RUNTIME__.template(e(provenance(co, m, p))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 762) + __MARKET_STRUCTURE_RUNTIME__.template(m.rows.join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 763))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 764) + __MARKET_STRUCTURE_RUNTIME__.template(e(data.sha256)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 765);
  }
  function render(ticker) {
    const co = init(ticker), root = byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 766)), p = co.periods.find(x => x.id === ui.period);
    if (!p) {
      root.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 767);
      return;
    }
    const f = focus.companies[ticker], m = co.metrics[ui.metric], rev = co.metrics[f.revenue], eps = co.metrics[f.eps], options = pref[ticker].filter(id => co.metrics[id]);
    const rv = value(co, rev, p), ev = value(co, eps, p), ps = forecastPeriods(co), all = Object.values(co.metrics).filter(m => co.periods.some((p, i) => p.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 768) && n(m.values[i][__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 769)]))).sort((a, b) => a.label.localeCompare(b.label));
    root.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 770) + __MARKET_STRUCTURE_RUNTIME__.template(e(ticker)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 771) + __MARKET_STRUCTURE_RUNTIME__.template(e(data.as_of)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 772) + __MARKET_STRUCTURE_RUNTIME__.template(ui.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 773) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 774) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 775)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 776) + __MARKET_STRUCTURE_RUNTIME__.template(ui.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 777) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 778) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 779)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 780) + __MARKET_STRUCTURE_RUNTIME__.template(ps.map(x => __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 781) + __MARKET_STRUCTURE_RUNTIME__.template(x.id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 782) + __MARKET_STRUCTURE_RUNTIME__.template(x.id === p.id ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 783) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 784)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 785) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 786)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 787))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 788) + __MARKET_STRUCTURE_RUNTIME__.template(e(p.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 789) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(rv, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 790))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 791) + __MARKET_STRUCTURE_RUNTIME__.template(e(rev.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 792) + __MARKET_STRUCTURE_RUNTIME__.template(e(provenance(co, rev, p))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 793) + __MARKET_STRUCTURE_RUNTIME__.template(e(p.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 794) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(ev, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 795))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 796) + __MARKET_STRUCTURE_RUNTIME__.template(e(eps.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 797) + __MARKET_STRUCTURE_RUNTIME__.template(e(provenance(co, eps, p))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 798) + __MARKET_STRUCTURE_RUNTIME__.template(trackingHTML(co, p)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 799) + __MARKET_STRUCTURE_RUNTIME__.template(bridgeHTML(co, p)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 800) + __MARKET_STRUCTURE_RUNTIME__.template(rotheraHTML()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 801) + __MARKET_STRUCTURE_RUNTIME__.template(e(p.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 802) + __MARKET_STRUCTURE_RUNTIME__.template(tableHTML(co, p)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 803) + __MARKET_STRUCTURE_RUNTIME__.template(researchHTML()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 804) + __MARKET_STRUCTURE_RUNTIME__.template([...new Set([...options, ui.metric])].map(id => __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 805) + __MARKET_STRUCTURE_RUNTIME__.template(id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 806) + __MARKET_STRUCTURE_RUNTIME__.template(id === ui.metric ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 807) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 808)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 809) + __MARKET_STRUCTURE_RUNTIME__.template(e(co.metrics[id].label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 810) + __MARKET_STRUCTURE_RUNTIME__.template(e(unit(co.metrics[id]))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 811)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 812))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 813) + __MARKET_STRUCTURE_RUNTIME__.template(ui.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 814) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 815) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 816)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 817) + __MARKET_STRUCTURE_RUNTIME__.template(ui.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 818) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 819) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 820)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 821) + __MARKET_STRUCTURE_RUNTIME__.template(ui.range === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 822) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 823) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 824)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 825) + __MARKET_STRUCTURE_RUNTIME__.template(ui.range === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 826) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 827) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 828)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 829) + __MARKET_STRUCTURE_RUNTIME__.template(e(m.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 830) + __MARKET_STRUCTURE_RUNTIME__.template(lineChart(co, m)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 831) + __MARKET_STRUCTURE_RUNTIME__.template(scenarioHTML(co, m, p)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 832) + __MARKET_STRUCTURE_RUNTIME__.template(all.length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 833) + __MARKET_STRUCTURE_RUNTIME__.template(all.map(x => __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 834) + __MARKET_STRUCTURE_RUNTIME__.template(x.id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 835) + __MARKET_STRUCTURE_RUNTIME__.template(x.id === ui.metric ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 836) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 837)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 838) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 839) + __MARKET_STRUCTURE_RUNTIME__.template(e(unit(x))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 840)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 841))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 842) + __MARKET_STRUCTURE_RUNTIME__.template(revisionHTML(co, p)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 843) + __MARKET_STRUCTURE_RUNTIME__.template(sourceHTML(co, m, p)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 844);
    byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 845)).onchange = ev => {
      ui.kind = ev.target.value;
      ui.period = null;
      render(ticker);
    };
    byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 846)).onchange = ev => {
      ui.period = ev.target.value;
      render(ticker);
    };
    byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 847)).onclick = () => {
      ui.kind = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 848);
      ui.period = null;
      render(ticker);
    };
    for (const id of [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 849), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 850)]) byId(id).onchange = ev => {
      ui.metric = ev.target.value;
      render(ticker);
    };
    byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 851)).onchange = ev => {
      ui.view = ev.target.value;
      render(ticker);
    };
    byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 852)).onchange = ev => {
      ui.range = ev.target.value;
      render(ticker);
    };
    root.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 853)).forEach(b => b.onclick = () => {
      ui.metric = b.dataset.csMetric;
      render(ticker);
    });
    if (root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 854))) byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 855)).onchange = ev => {
      ui.pace = ev.target.value;
      render(ticker);
    };
    if (root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 856))) byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 857)).onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 858));
    byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 859)).oninput = ev => {
      const raw = ev.target.value.trim(), sc = raw === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 860) ? null : Number(raw);
      if (n(sc)) scenarios.set(scenarioKey(), sc); else scenarios.delete(scenarioKey());
      byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 861)).textContent = signed(gap(sc, value(co, m, p), m), m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 862) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 863) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 864));
      byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 865)).innerHTML = lineChart(co, m);
    };
    if (root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 866))) for (const [id, key] of [[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 867), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 868)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 869), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 870)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 871), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 872)]]) byId(id).oninput = ev => {
      const k = ticker + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 873) + p.id, s = bridgeInputs.get(k) || ({}), raw = ev.target.value.trim();
      s[key] = raw === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 874) ? null : Number(raw);
      bridgeInputs.set(k, s);
      const v = epsSensitivity(bridge(ticker, co, p).delta, s.flow, s.tax, s.shares);
      byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 875)).textContent = n(v) ? (v >= __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 876) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 877) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 878)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 879) + fmt(v, __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 880)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 881);
    };
    byId(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 882)).onclick = () => exportCSV(co, p);
  }
  function exportCSV(co, p) {
    const ids = [...new Set([...pref[ui.company], ui.metric])].filter(id => co.metrics[id]);
    const rows = [[__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 883), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 884), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 885), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 886), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 887), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 888), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 889), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 890), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 891), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 892), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 893), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 894)]];
    for (const id of ids) {
      const m = co.metrics[id], v = value(co, m, p), sc = scenarios.get([ui.company, p.id, id].join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 895)));
      rows.push([ui.company, m.label, id, unit(m), p.label, v, sc, gap(sc, v, m), m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 896) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 897) : __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 898), data.as_of, data.source_file, provenance(co, m, p)]);
    }
    const csv = rows.map(row => row.map(v => {
      let s = v ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 899);
      if (typeof s === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 900) && new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 901), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 902)).test(s)) s = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 903) + s;
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 904) + String(s).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 905), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 906)), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 907)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 908);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 909))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 910));
    const url = URL.createObjectURL(new Blob([__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 911) + csv], {
      type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 912)
    })), a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 913));
    a.href = url;
    a.download = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 914) + __MARKET_STRUCTURE_RUNTIME__.template(ui.company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 915) + __MARKET_STRUCTURE_RUNTIME__.template(p.id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 916) + __MARKET_STRUCTURE_RUNTIME__.template(data.as_of) + __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 917);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 918));
  }
  return {
    render,
    data,
    ui,
    value,
    growth,
    gap,
    pacing,
    lineChart,
    provenance,
    safeCalc,
    bridge,
    epsSensitivity
  };
})();
(() => {
  const priorSetTab = setTab, priorSetup = setupCompany;
  let priorSnapshot = null;
  setTab = function (tab, reset = false) {
    if (state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 919) && tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 920) && priorSnapshot) {
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 921)).textContent = priorSnapshot.date;
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 922)).textContent = priorSnapshot.sub;
      priorSnapshot = null;
    }
    if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 923) && state.tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 924)) priorSnapshot = {
      date: $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 925)).textContent,
      sub: $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 926)).textContent
    };
    priorSetTab(tab, reset);
    $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 927)).hidden = tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 928);
    if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 929)) {
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 930)).open = false;
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 931)).hidden = true;
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 932)).hidden = true;
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 933)).textContent = window.Consensus.data.as_of;
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 934)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 935);
      window.Consensus.render(state.company);
    }
  };
  setupCompany = function () {
    const keep = state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 936);
    if (keep) {
      priorSnapshot = null;
      state.tab = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 937);
    }
    priorSetup();
    if (keep) setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 938));
  };
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 939),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 940),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 941),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 942),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 943),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 944),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 945),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 946),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 947),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 948),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 949),
    report_url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 950),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 951),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 952), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 953), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 954), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 955)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 956),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 957),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 958),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 959),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 960),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 961),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 962),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 963),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 964)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 965),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 966),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 967)
    }],
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 968),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 969),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 970)
  };
  if (!window.Consensus.data.focus.research.some(x => x.research_id === record.research_id)) window.Consensus.data.focus.research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 971);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 972);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 973);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 974);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 975);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 976));
  }
})();
(() => {
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 977),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 978),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 979),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 980),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 981),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 982),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 983),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 984),
    companies: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 985), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 986), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 987), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 988), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 989)],
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 990),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 991),
    report_url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 992),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 993),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 994), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 995), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 996), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 997)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 998),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 999),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1000),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1001),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1002),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1003),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1004),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1005),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1006)
  };
  if (!window.Consensus.data.focus.research.some(x => x.research_id === record.research_id)) window.Consensus.data.focus.research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1007);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1008);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1009);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1010);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1011);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1012));
  }
})();
(() => {
  const sourceUrl = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1013);
  const messageId = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1014);
  const records = [{
    message_id: messageId,
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1015),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1016),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1017),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1018),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1019),
    url: sourceUrl,
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1020),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1021),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1022),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1023),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1024),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1025), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1026), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1027), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1028)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1029),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1030),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1031),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1032),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1033),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1034),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1035),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1036),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1037)
  }, {
    message_id: messageId,
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1038),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1039),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1040),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1041),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1042),
    url: sourceUrl,
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1043),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1044),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1045),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1046),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1047),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1048),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1049)
    }],
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1050),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1051), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1052), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1053), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1054)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1055),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1056),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1057),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1058),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1059),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1060),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1061),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1062),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1063)
  }, {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1064),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1065),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1066),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1067),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1068),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1069),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1070),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1071),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1072),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1073),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1074),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1075),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1076), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1077), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1078), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1079)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1080),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1081),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1082),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1083),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1084),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1085),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1086),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1087),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1088)
  }];
  const research = window.Consensus.data.focus.research;
  for (const record of records) if (!research.some(x => x.research_id === record.research_id)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1089);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1090);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1091);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1092);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1093);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1094));
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1095));
  }
})();
(() => {
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1096),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1097),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1098),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1099),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1100),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1101),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1102),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1103),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1104),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1105),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1106),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1107),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1108), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1109), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1110), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1111), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1112)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1113),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1114),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1115),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1116),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1117),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1118),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1119),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1120),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1121)
  };
  const research = window.Consensus.data.focus.research;
  if (!research.some(x => x.research_id === record.research_id)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1122);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1123);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1124);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1125);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1126);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1127));
  }
})();
(() => {
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1128),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1129),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1130),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1131),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1132),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1133),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1134),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1135),
    companies: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1136), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1137), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1138), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1139), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1140), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1141)],
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1142),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1143),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1144),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1145), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1146), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1147), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1148), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1149)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1150),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1151),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1152),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1153),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1154),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1155),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1156),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1157),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1158)
  };
  const research = window.Consensus.data.focus.research;
  if (!research.some(x => x.research_id === record.research_id)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1159);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1160);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1161);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1162);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1163);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1164));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const carlRecord = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1165),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1166),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1167),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1168),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1169),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1170),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1171),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1172),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1173),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1174),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1175),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1176),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1177), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1178), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1179), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1180)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1181),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1182),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1183),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1184),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1185),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1186),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1187),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1188),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1189)
  };
  if (!research.some(x => x.research_id === carlRecord.research_id)) research.push(carlRecord);
  const kbw = research.find(x => x.research_id === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1190));
  if (kbw) {
    kbw.related_sources = kbw.related_sources || [];
    const weeklyUrl = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1191);
    if (!kbw.related_sources.some(x => x.url === weeklyUrl)) kbw.related_sources.push({
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1192),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1193),
      url: weeklyUrl,
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1194)
    });
    const caution = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1195);
    if (!kbw.counterevidence.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1196))) kbw.counterevidence += caution;
  }
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1197);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1198);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1199);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1200);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1201);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1202));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const hoodChain = research.find(x => x.research_id === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1203));
  if (hoodChain) {
    hoodChain.related_sources = hoodChain.related_sources || [];
    const oneLinersUrl = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1204);
    if (!hoodChain.related_sources.some(x => x.url === oneLinersUrl)) hoodChain.related_sources.push({
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1205),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1206),
      url: oneLinersUrl,
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1207)
    });
    if (!hoodChain.observation.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1208))) hoodChain.observation += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1209);
    hoodChain.test = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1210);
  }
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1211);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1212);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1213);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1214);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1215);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1216));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const regulatory = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1217),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1218),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1219),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1220),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1221),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1222),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1223),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1224),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1225),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1226),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1227),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1228),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1229), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1230), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1231), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1232)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1233),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1234),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1235),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1236),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1237),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1238),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1239),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1240),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1241)
  };
  const sentiment = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1242),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1243),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1244),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1245),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1246),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1247),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1248),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1249),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1250),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1251),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1252),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1253),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1254), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1255), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1256), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1257)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1258),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1259),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1260),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1261),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1262),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1263),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1264),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1265),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1266)
  };
  for (const record of [regulatory, sentiment]) if (!research.some(x => x.research_id === record.research_id)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1267);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1268);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1269);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1270);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1271);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1272));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const predictionReg = research.find(x => x.research_id === __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1273));
  if (predictionReg) {
    predictionReg.related_sources = predictionReg.related_sources || [];
    const followUp = {
      [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1274)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1275),
      [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1276)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1277),
      [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1278)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1279),
      [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1280)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1281)
    };
    if (!predictionReg.related_sources.some(x => x.url === followUp.url)) predictionReg.related_sources.push(followUp);
    if (!predictionReg.observation.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1282))) predictionReg.observation += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1283);
    if (!predictionReg.counterevidence.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1284))) predictionReg.counterevidence += __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1285);
    predictionReg.test = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1286);
  }
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1287);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1288);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1289);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1290);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1291);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1292));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1293),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1294),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1295),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1296),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1297),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1298),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1299),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1300),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1301),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1302),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1303),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1304),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1305), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1306), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1307), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1308)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1309),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1310),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1311),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1312),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1313),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1314),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1315),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1316),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1317)
  };
  if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1318);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1319);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1320);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1321);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1322);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1323));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1324),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1325),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1326),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1327),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1328),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1329),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1330),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1331),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1332),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1333),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1334),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1335),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1336), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1337), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1338), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1339), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1340)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1341),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1342),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1343),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1344),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1345),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1346),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1347),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1348),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1349)
  };
  if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1350);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1351);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1352);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1353);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1354);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1355));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1356),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1357),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1358),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1359),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1360),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1361),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1362),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1363),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1364),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1365),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1366),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1367),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1368), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1369), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1370), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1371), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1372), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1373)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1374),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1375),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1376),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1377),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1378),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1379),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1380),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1381),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1382)
  };
  if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1383);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1384);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1385);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1386);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1387);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1388));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1389),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1390),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1391),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1392),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1393),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1394),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1395),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1396),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1397),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1398),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1399),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1400),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1401), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1402), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1403), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1404), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1405), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1406)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1407),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1408),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1409),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1410),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1411),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1412),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1413),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1414),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1415),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1416),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1417),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1418),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1419)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1420),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1421),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1422),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1423)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1424),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1425),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1426),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1427)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1428),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1429),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1430),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1431)
    }]
  };
  if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1432);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1433);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1434);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1435);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1436);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1437));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const records = [{
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1438),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1439),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1440),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1441),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1442),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1443),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1444),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1445),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1446),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1447),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1448),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1449),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1450), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1451), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1452), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1453), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1454)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1455),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1456),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1457),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1458),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1459),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1460),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1461),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1462),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1463)
  }, {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1464),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1465),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1466),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1467),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1468),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1469),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1470),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1471),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1472),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1473),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1474),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1475),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1476), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1477), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1478), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1479), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1480)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1481),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1482),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1483),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1484),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1485),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1486),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1487),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1488),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1489),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1490),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1491),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1492),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1493)
    }]
  }];
  for (const record of records) if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1494);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1495);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1496);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1497);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1498);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1499));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1500),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1501),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1502),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1503),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1504),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1505),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1506),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1507),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1508),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1509),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1510),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1511),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1512), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1513), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1514), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1515), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1516), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1517)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1518),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1519),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1520),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1521),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1522),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1523),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1524),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1525),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1526),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1527),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1528),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1529),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1530)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1531),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1532),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1533),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1534)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1535),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1536),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1537),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1538)
    }]
  };
  if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1539);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1540);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1541);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1542);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1543);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1544));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1545),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1546),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1547),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1548),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1549),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1550),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1551),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1552),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1553),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1554),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1555),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1556),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1557), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1558), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1559), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1560)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1561),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1562),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1563),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1564),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1565),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1566),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1567),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1568),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1569),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1570),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1571),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1572),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1573)
    }]
  };
  if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1574);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1575);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1576);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1577);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1578);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1579));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1580),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1581),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1582),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1583),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1584),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1585),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1586),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1587),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1588),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1589),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1590),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1591),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1592), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1593), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1594), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1595), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1596)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1597),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1598),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1599),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1600),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1601),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1602),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1603),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1604),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1605),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1606),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1607),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1608),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1609)
    }]
  };
  if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1610);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1611);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1612);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1613);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1614);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1615));
  }
})();
(() => {
  const research = window.Consensus.data.focus.research;
  const records = [{
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1616),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1617),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1618),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1619),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1620),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1621),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1622),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1623),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1624),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1625),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1626),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1627),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1628), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1629), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1630), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1631)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1632),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1633),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1634),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1635),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1636),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1637),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1638),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1639),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1640)
  }, {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1641),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1642),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1643),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1644),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1645),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1646),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1647),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1648),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1649),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1650),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1651),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1652),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1653), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1654), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1655), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1656)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1657),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1658),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1659),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1660),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1661),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1662),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1663),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1664),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1665)
  }, {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1666),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1667),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1668),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1669),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1670),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1671),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1672),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1673),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1674),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1675),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1676),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1677),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1678), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1679), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1680), __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1681)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1682),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1683),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1684),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1685),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1686),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1687),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1688),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1689),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1690)
  }];
  for (const record of records) if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  for (const record of records) record.sender = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1691);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1692);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1693);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1694);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1695);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1696);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-009", 1697));
  }
})();
