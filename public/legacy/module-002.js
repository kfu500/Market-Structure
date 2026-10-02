// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  "use strict";
  const DAY = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 0);
  const escape = x => String(x ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 1)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 2), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 3)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 4)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 5),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 6)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 7),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 8)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 9),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 10)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 11),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 12)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 13)
  })[c]);
  const numeric = x => typeof x === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 14) && Number.isFinite(x);
  const utc = d => new Date(d + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 15)).getTime();
  const day = t => new Date(t).toISOString().slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 16), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 17));
  const safeURL = x => {
    try {
      const u = new URL(x);
      return [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 18), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 19)].includes(u.protocol) ? u.href : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 20);
    } catch {
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 21);
    }
  };
  const link = (url, label) => safeURL(url) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 22) + __MARKET_STRUCTURE_RUNTIME__.template(escape(safeURL(url))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 23) + __MARKET_STRUCTURE_RUNTIME__.template(escape(label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 24) : escape(label);
  const fmt = (n, unit = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 25)) => !numeric(n) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 26) : (unit.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 27)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 28) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 29)) + (Math.abs(n) >= __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 30) ? (n / __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 31)).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 32)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 33) : Math.abs(n) >= __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 34) ? (n / __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 35)).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 36)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 37) : n.toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 38), {
    maximumFractionDigits: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 39)
  }));
  const allowedUnits = new Set([__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 40), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 41), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 42), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 43)]);
  function validate(d) {
    if (!d || d.schema_version !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 44) || !Array.isArray(d.series) || !Array.isArray(d.records) || !Array.isArray(d.snapshots) || !Array.isArray(d.sources)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 45));
    if (d.records.length > __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 46) || d.snapshots.length > __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 47)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 48));
    const ids = new Set();
    d.series.forEach(s => {
      if (!s.id || ids.has(s.id) || ![__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 49), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 50)].includes(s.kind) || !allowedUnits.has(s.unit) || !s.label || !s.scope) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 51));
      ids.add(s.id);
    });
    const seen = new Set();
    d.records.forEach(r => {
      if (!ids.has(r.series_id) || !new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 52), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 53)).test(r.date) || !Number.isFinite(utc(r.date)) || day(utc(r.date)) !== r.date || !numeric(r.value) || r.value < __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 54)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 55));
      if (![__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 56), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 57), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 58)].includes(r.status) || r.window !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 59) || !r.source_url || !safeURL(r.source_url)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 60));
      const key = r.series_id + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 61) + r.date;
      if (seen.has(key)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 62) + key);
      seen.add(key);
    });
    const snapshots = new Set();
    d.snapshots.forEach(r => {
      if (!r.venue || !r.instrument || !r.product_type || !r.as_of || !Number.isFinite(Date.parse(r.as_of))) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 63));
      const key = [r.venue, r.product_type, r.instrument].join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 64));
      if (snapshots.has(key)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 65));
      snapshots.add(key);
      [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 66), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 67), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 68)].forEach(k => {
        if (r[k] != null && (!numeric(r[k]) || r[k] < __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 69))) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 70) + k);
      });
      if (r.funding_rate != null && !numeric(r.funding_rate)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 71));
    });
    if (d.evidence && !Array.isArray(d.evidence) || d.watchlist && !Array.isArray(d.watchlist) || d.methodology && !Array.isArray(d.methodology)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 72));
    if (d.reported_data_version != null) {
      if (d.reported_data_version !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 73) || !Array.isArray(d.reference_sources) || !Array.isArray(d.reported_series) || !Array.isArray(d.reported_observations)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 74));
      const sources = new Set(), definitions = new Set(), observations = new Set();
      d.reference_sources.forEach(s => {
        if (!s.id || sources.has(s.id) || !s.label || s.url && !safeURL(s.url)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 75));
        sources.add(s.id);
      });
      d.reported_series.forEach(s => {
        if (!s.id || definitions.has(s.id) || !s.label || !s.unit || !s.scope) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 76));
        definitions.add(s.id);
      });
      const dateOK = s => typeof s === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 77) && new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 78), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 79)).test(s) && Number.isFinite(utc(s)) && day(utc(s)) === s;
      d.reported_observations.forEach(r => {
        if (!r.id || observations.has(r.id) || !definitions.has(r.series_id) || !sources.has(r.source_id) || !numeric(r.value) || r.value < __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 80) || !r.period || !dateOK(r.retrieved_on)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 81));
        if (![__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 82), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 83), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 84), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 85), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 86), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 87), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 88)].includes(r.window)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 89));
        if (r.period_start != null && !dateOK(r.period_start) || r.period_end != null && !dateOK(r.period_end)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 90));
        if (r.period_start && r.period_end && r.period_start > r.period_end) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 91));
        if (r.window === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 92) && (!r.period_start || !r.period_end || r.period_start.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 93), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 94)) !== r.period_end.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 95), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 96)) || r.period_start.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 97)) !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 98) || new Date(utc(r.period_end) + DAY).getUTCDate() !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 99))) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 100));
        observations.add(r.id);
      });
      (d.reported_open_interest || []).forEach(r => {
        if (!numeric(r.value) || r.value < __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 101) || !sources.has(r.source_id) || !r.unit) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 102));
      });
      for (const group of [d.report_venue_adv, d.report_mix]) if (group) {
        if (!sources.has(group.source_id) || !Array.isArray(group.values) || group.values.some(r => !numeric(r.value) || r.value < __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 103))) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 104));
      }
      if (d.report_pdf && (!new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 105), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 106)).test(d.report_pdf.base64) || d.report_pdf.base64.length > __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 107))) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 108));
    }
    return d;
  }
  function transformed(records, definition, view, cutoff = new Date().toISOString().slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 109), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 110))) {
    const rows = records.filter(r => r.series_id === definition.id && r.status === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 111) && r.window === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 112) && r.date < cutoff).sort((a, b) => a.date.localeCompare(b.date));
    const index = new Map(rows.map(r => [r.date, r]));
    if (view === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 113)) return rows.map(r => ({
      ...r,
      derived: false
    }));
    if (definition.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 114) && view !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 115)) return [];
    return rows.map(r => {
      if (view === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 116)) {
        const date = Number(r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 117), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 118))) - __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 119) + r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 120));
        if (day(utc(date)) !== date) return null;
        const prior = index.get(date);
        return prior && prior.value !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 121) ? {
          ...r,
          value: (r.value / prior.value - __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 122)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 123),
          derived: true,
          formula: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 124),
          comparison_date: date
        } : null;
      }
      let start;
      if (view === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 125) || view === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 126)) start = utc(r.date) - (view === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 127) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 128) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 129)) * DAY; else if (view === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 130)) {
        const dt = new Date(utc(r.date));
        if (new Date(utc(r.date) + DAY).getUTCDate() !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 131)) return null;
        start = Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() - __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 132), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 133));
      } else return null;
      let sum = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 134), count = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 135);
      for (let t = start; t <= utc(r.date); t += DAY) {
        const p = index.get(day(t));
        if (!p) return null;
        sum += p.value;
        count++;
      }
      return {
        ...r,
        value: sum / count,
        derived: true,
        formula: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 136),
        window_start: day(start),
        days: count
      };
    }).filter(Boolean);
  }
  function chart(rows, unit) {
    if (!rows.length) return __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 137);
    const w = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 138), h = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 139), left = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 140), right = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 141), top = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 142), bottom = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 143);
    let lo = rows.reduce((v, r) => Math.min(v, r.value), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 144)), hi = rows.reduce((v, r) => Math.max(v, r.value), -Infinity);
    if (hi === lo) hi = lo + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 145);
    const first = utc(rows[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 146)].date), last = utc(rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 147)).date);
    const x = r => left + (last === first ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 148) : (utc(r.date) - first) / (last - first)) * (w - left - right);
    const y = v => top + (hi - v) / (hi - lo) * (h - top - bottom);
    let svg = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 149) + __MARKET_STRUCTURE_RUNTIME__.template(escape(unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 150) + __MARKET_STRUCTURE_RUNTIME__.template(w) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 151) + __MARKET_STRUCTURE_RUNTIME__.template(h) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 152);
    for (let i = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 153); i <= __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 154); i++) {
      const v = lo + (hi - lo) * i / __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 155);
      svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 156) + __MARKET_STRUCTURE_RUNTIME__.template(left) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 157) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 158) + __MARKET_STRUCTURE_RUNTIME__.template(w - right) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 159) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 160) + __MARKET_STRUCTURE_RUNTIME__.template(left - __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 161)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 162) + __MARKET_STRUCTURE_RUNTIME__.template(y(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 163)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 164) + __MARKET_STRUCTURE_RUNTIME__.template(escape(fmt(v))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 165);
    }
    rows.forEach(r => svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 166) + __MARKET_STRUCTURE_RUNTIME__.template(x(r)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 167) + __MARKET_STRUCTURE_RUNTIME__.template(y(r.value)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 168) + __MARKET_STRUCTURE_RUNTIME__.template(escape(r.date + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 169) + fmt(r.value) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 170) + unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 171));
    svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 172) + __MARKET_STRUCTURE_RUNTIME__.template(left) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 173) + __MARKET_STRUCTURE_RUNTIME__.template(h - __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 174)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 175) + __MARKET_STRUCTURE_RUNTIME__.template(escape(rows[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 176)].date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 177) + __MARKET_STRUCTURE_RUNTIME__.template(w - right) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 178) + __MARKET_STRUCTURE_RUNTIME__.template(h - __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 179)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 180) + __MARKET_STRUCTURE_RUNTIME__.template(escape(rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 181)).date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 182);
    return svg;
  }
  const money = n => numeric(n) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 183) + fmt(n) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 184);
  function reference(id, locator = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 185)) {
    const s = data.reference_sources?.find(s => s.id === id);
    if (!s) return escape(locator);
    const label = s.label + (locator ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 186) + locator : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 187));
    return s.url ? link(s.url, label) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 188) + __MARKET_STRUCTURE_RUNTIME__.template(escape(locator)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 189) + __MARKET_STRUCTURE_RUNTIME__.template(escape(label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 190);
  }
  function monthlyChange(rows, latest) {
    if (latest.window !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 191)) return null;
    const dt = new Date(utc(latest.period_start));
    dt.setUTCMonth(dt.getUTCMonth() - __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 192));
    const prior = rows.find(r => r.window === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 193) && r.series_id === latest.series_id && r.source_id === latest.source_id && r.period_start === day(dt.getTime()));
    return prior && prior.value > __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 194) ? (latest.value / prior.value - __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 195)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 196) : null;
  }
  function bars(rows, label, format = money) {
    const maximum = Math.max(...rows.map(r => r.value), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 197));
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 198) + rows.map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 199) + __MARKET_STRUCTURE_RUNTIME__.template(escape(r[label])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 200) + __MARKET_STRUCTURE_RUNTIME__.template(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 201) * r.value / maximum) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 202) + __MARKET_STRUCTURE_RUNTIME__.template(escape(format(r.value))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 203)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 204)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 205);
  }
  function reportedActivity() {
    const records = data.reported_observations || [], defs = data.reported_series || [];
    const point = id => records.find(r => r.id === id);
    let out = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 206);
    for (const [id, title, caption] of [[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 207), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 208), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 209)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 210), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 211), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 212)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 213), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 214), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 215)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 216), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 217), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 218)]]) {
      const r = point(id);
      if (!r) continue;
      out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 219) + __MARKET_STRUCTURE_RUNTIME__.template(escape(title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 220) + __MARKET_STRUCTURE_RUNTIME__.template(r.precision === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 221) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 222) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 223)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 224) + __MARKET_STRUCTURE_RUNTIME__.template(money(r.value)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 225) + __MARKET_STRUCTURE_RUNTIME__.template(r.window === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 226) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 227) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 228)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 229) + __MARKET_STRUCTURE_RUNTIME__.template(escape(caption)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 230) + __MARKET_STRUCTURE_RUNTIME__.template(reference(r.source_id, r.source_locator)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 231);
    }
    out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 232);
    for (const id of [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 233), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 234), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 235), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 236)]) {
      const def = defs.find(s => s.id === id), rows = records.filter(r => r.series_id === id);
      if (!def || !rows.length) continue;
      const v = w => rows.find(r => r.window === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 237) + w)?.value;
      out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 238) + __MARKET_STRUCTURE_RUNTIME__.template(escape(def.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 239) + __MARKET_STRUCTURE_RUNTIME__.template(escape(def.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 240) + __MARKET_STRUCTURE_RUNTIME__.template(money(v(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 241)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 242) + __MARKET_STRUCTURE_RUNTIME__.template(money(v(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 243)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 244) + __MARKET_STRUCTURE_RUNTIME__.template(money(v(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 245)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 246) + __MARKET_STRUCTURE_RUNTIME__.template(money(numeric(v(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 247))) ? v(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 248)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 249) : null)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 250) + __MARKET_STRUCTURE_RUNTIME__.template(reference(rows[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 251)].source_id)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 252);
    }
    out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 253);
    if (data.reported_open_interest?.length) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 254) + data.reported_open_interest.map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 255) + __MARKET_STRUCTURE_RUNTIME__.template(escape(r.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 256) + __MARKET_STRUCTURE_RUNTIME__.template(money(r.value)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 257) + __MARKET_STRUCTURE_RUNTIME__.template(escape(r.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 258) + __MARKET_STRUCTURE_RUNTIME__.template(reference(r.source_id)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 259)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 260)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 261);
    out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 262);
    const monthly = records.filter(r => r.window === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 263)).sort((a, b) => a.period_start.localeCompare(b.period_start));
    for (const id of [...new Set(monthly.map(r => r.series_id))]) {
      const def = defs.find(s => s.id === id), rows = monthly.filter(r => r.series_id === id), last = rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 264)), growth = monthlyChange(rows, last);
      out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 265) + __MARKET_STRUCTURE_RUNTIME__.template(escape(def.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 266) + __MARKET_STRUCTURE_RUNTIME__.template(escape(def.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 267) + __MARKET_STRUCTURE_RUNTIME__.template(growth != null ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 268) + __MARKET_STRUCTURE_RUNTIME__.template(growth.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 269))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 270) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 271)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 272) + __MARKET_STRUCTURE_RUNTIME__.template(bars(rows, __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 273))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 274) + __MARKET_STRUCTURE_RUNTIME__.template(reference(last.source_id)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 275) + __MARKET_STRUCTURE_RUNTIME__.template(reference(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 276))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 277);
    }
    const periods = records.filter(r => [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 278), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 279), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 280)].includes(r.window));
    if (periods.length) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 281) + periods.map(r => {
      const def = defs.find(s => s.id === r.series_id);
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 282) + __MARKET_STRUCTURE_RUNTIME__.template(escape(def.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 283) + __MARKET_STRUCTURE_RUNTIME__.template(escape(def.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 284) + __MARKET_STRUCTURE_RUNTIME__.template(escape(r.period)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 285) + __MARKET_STRUCTURE_RUNTIME__.template(r.precision === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 286) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 287) : r.precision === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 288) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 289) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 290)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 291) + __MARKET_STRUCTURE_RUNTIME__.template(money(r.value)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 292) + __MARKET_STRUCTURE_RUNTIME__.template(r.window === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 293) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 294) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 295)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 296) + __MARKET_STRUCTURE_RUNTIME__.template(reference(r.source_id, r.source_locator)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 297) + __MARKET_STRUCTURE_RUNTIME__.template(escape(r.note)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 298);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 299)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 300);
    const venue = data.report_venue_adv, mix = data.report_mix;
    out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 301);
    if (venue) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 302) + __MARKET_STRUCTURE_RUNTIME__.template(bars(venue.values, __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 303), n => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 304) + money(n))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 305) + __MARKET_STRUCTURE_RUNTIME__.template(reference(venue.source_id, venue.source_locator)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 306);
    if (mix) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 307) + __MARKET_STRUCTURE_RUNTIME__.template(escape(mix.period)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 308) + __MARKET_STRUCTURE_RUNTIME__.template(bars(mix.values, __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 309), n => n + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 310))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 311) + __MARKET_STRUCTURE_RUNTIME__.template(mix.gold_silver_share) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 312) + __MARKET_STRUCTURE_RUNTIME__.template(reference(mix.source_id, mix.gold_silver_source_locator)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 313) + __MARKET_STRUCTURE_RUNTIME__.template(reference(mix.source_id, mix.source_locator)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 314);
    out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 315);
    return out;
  }
  let data;
  if (typeof document !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 316) && document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 317))) data = validate(JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 318)).textContent));
  const state = {
    section: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 319),
    venue: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 320),
    series: data?.series[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 321)]?.id || __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 322),
    view: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 323)
  };
  function download(name, text, type) {
    const a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 324)), url = URL.createObjectURL(new Blob([text], {
      type
    }));
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 325));
  }
  function render() {
    const root = document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 326));
    if (!root || !data) return;
    const selected = data.series.find(s => s.id === state.series) || data.series[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 327)];
    if (selected) state.series = selected.id;
    if (selected?.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 328) && ![__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 329), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 330)].includes(state.view)) state.view = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 331);
    const all = data.snapshots.filter(r => state.venue === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 332) || r.venue + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 333) + r.product_type === state.venue);
    const choices = [...new Set(data.snapshots.map(r => r.venue + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 334) + r.product_type))].sort();
    let out = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 335);
    out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 336) + [[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 337), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 338)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 339), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 340)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 341), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 342)]].map(([id, label]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 343) + __MARKET_STRUCTURE_RUNTIME__.template(state.section === id ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 344) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 345)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 346) + __MARKET_STRUCTURE_RUNTIME__.template(id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 347) + __MARKET_STRUCTURE_RUNTIME__.template(label) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 348)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 349)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 350);
    if (state.section === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 351)) {
      if (data.reported_observations?.length) out += reportedActivity();
      if (data.snapshots.length) {
        out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 352) + choices.map(c => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 353) + __MARKET_STRUCTURE_RUNTIME__.template(c === state.venue ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 354) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 355)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 356) + __MARKET_STRUCTURE_RUNTIME__.template(escape(c)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 357)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 358)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 359);
        if (all.length) {
          out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 360) + all.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 361), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 362)).map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 363) + escape(r.instrument) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 364) + escape(r.venue + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 365) + r.product_type) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 366) + escape(r.title) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 367) + escape(r.bucket) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 368) + escape(r.mapping_status) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 369) + fmt(r.volume_24h) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 370) + escape(r.volume_unit) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 371) + fmt(r.open_interest) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 372) + escape(r.open_interest_unit) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 373) + (numeric(r.funding_rate) ? (r.funding_rate * __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 374)).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 375)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 376) + escape(r.funding_interval_hours) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 377) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 378)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 379) + (numeric(r.spread_bps) ? r.spread_bps.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 380)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 381) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 382)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 383) + escape(r.as_of) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 384) + link(r.source_url, __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 385)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 386) + escape(r.measurement) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 387)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 388)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 389) + Math.min(all.length, __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 390)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 391) + all.length + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 392);
        } else out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 393);
        out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 394);
      }
      if (data.records.length) {
        const rows = selected ? transformed(data.records, selected, state.view) : [];
        const unit = state.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 395) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 396) : (selected?.unit || __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 397)) + (selected?.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 398) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 399) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 400));
        const views = selected?.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 401) ? [[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 402), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 403)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 404), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 405)]] : [[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 406), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 407)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 408), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 409)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 410), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 411)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 412), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 413)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 414), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 415)]];
        out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 416) + data.series.map(s => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 417) + __MARKET_STRUCTURE_RUNTIME__.template(escape(s.id)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 418) + __MARKET_STRUCTURE_RUNTIME__.template(s.id === state.series ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 419) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 420)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 421) + __MARKET_STRUCTURE_RUNTIME__.template(escape(s.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 422)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 423)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 424) + views.map(([id, label]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 425) + __MARKET_STRUCTURE_RUNTIME__.template(state.view === id ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 426) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 427)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 428) + __MARKET_STRUCTURE_RUNTIME__.template(id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 429) + __MARKET_STRUCTURE_RUNTIME__.template(label) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 430)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 431)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 432) + escape(selected?.scope || __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 433)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 434) + escape(unit) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 435) + rows.length + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 436) + chart(rows, unit) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 437);
        if (rows.length) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 438) + rows.slice(-__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 439)).reverse().map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 440) + escape(r.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 441) + fmt(r.value) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 442) + escape(r.formula || __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 443)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 444) + link(r.source_url, __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 445)) + (r.days ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 446) + r.days + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 447) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 448)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 449)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 450)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 451);
        out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 452);
      }
      if (!data.reported_observations?.length && !data.snapshots.length && !data.records.length) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 453);
    } else if (state.section === __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 454)) {
      out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 455) + (data.watchlist || []).map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 456) + escape(r.asset) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 457) + escape(r.priority) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 458) + escape(r.cme) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 459) + escape(r.hyperliquid) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 460) + escape(r.kalshi) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 461) + escape(r.question) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 462)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 463)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 464);
    } else {
      if (data.readout?.length) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 465) + data.readout.map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 466) + escape(r) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 467)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 468)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 469) + reference(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 470)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 471);
      out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 472) + (data.evidence || []).map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 473) + escape(r.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 474) + escape(r.claim) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 475) + escape(r.test) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 476) + escape(r.source) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 477) + escape(r.file) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 478)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 479)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 480) + (data.methodology || []).map(t => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 481) + escape(t) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 482)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 483)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 484);
      out += __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 485) + (data.reference_sources || []).map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 486) + reference(r.id) + (r.date ? __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 487) + escape(r.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 488) : __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 489)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 490) + escape(r.description) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 491)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 492)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 493);
    }
    root.innerHTML = out;
    root.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 494)).forEach(b => b.onclick = () => {
      if (!data.report_pdf) return;
      const bytes = Uint8Array.from(atob(data.report_pdf.base64), c => c.charCodeAt(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 495)));
      const url = URL.createObjectURL(new Blob([bytes], {
        type: __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 496)
      }));
      const page = b.dataset.compReport.match(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 497), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 498)))?.[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 499)] || __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 500);
      window.open(url + __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 501) + page, __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 502), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 503));
      setTimeout(() => URL.revokeObjectURL(url), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 504));
    });
    root.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 505)).forEach(b => b.onclick = () => {
      state.section = b.dataset.compSection;
      render();
    });
    root.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 506)).forEach(b => b.onclick = () => {
      state.view = b.dataset.compView;
      render();
    });
    if (root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 507))) root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 508)).onchange = e => {
      state.series = e.target.value;
      render();
    };
    if (root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 509))) root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 510)).onchange = e => {
      state.venue = e.target.value;
      render();
    };
    root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 511)).onclick = () => root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 512)).click();
    root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 513)).onchange = async e => {
      try {
        const f = e.target.files[__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 514)];
        if (!f) return;
        if (f.size > __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 515) * __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 516) * __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 517)) throw Error(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 518));
        data = validate(JSON.parse(await f.text()));
        state.venue = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 519);
        render();
        document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 520)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 521);
      } catch (err) {
        document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 522)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 523) + err.message;
      }
    };
    root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 524)).onclick = () => download(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 525), JSON.stringify(data, null, __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 526)), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 527));
    root.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 528)).onclick = () => {
      const clone = document.documentElement.cloneNode(true);
      clone.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 529)).textContent = JSON.stringify(data).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 530), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 531)), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 532));
      download(__MARKET_STRUCTURE_RUNTIME__.literal("module-002", 533), __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 534) + clone.outerHTML, __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 535));
    };
  }
  const api = {
    render,
    validate,
    transformed,
    chart,
    monthlyChange
  };
  if (typeof window !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 536)) window.CompetitionTracker = api;
  if (typeof module !== __MARKET_STRUCTURE_RUNTIME__.literal("module-002", 537) && module.exports) module.exports = api;
})();
