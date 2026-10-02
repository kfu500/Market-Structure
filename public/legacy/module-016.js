// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  "use strict";
  const d = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 0)).textContent);
  const r = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 1)).textContent);
  const $p = id => document.getElementById(id), e = x => String(x ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 2)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 3), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 4)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 5)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 6),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 7)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 8),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 9)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 10),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 11)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 12),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 13)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 14)
  })[c]);
  const panel = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 15));
  panel.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 16);
  panel.hidden = true;
  $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 17)).before(panel);
  let mode = __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 18), week = d.weeks.length - __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 19), venue = __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 20);
  const bn = x => x == null ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 21) : (x / __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 22)).toFixed(x >= __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 23) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 24) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 25)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 26);
  const money = x => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 27) + x.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 28));
  function roundEven(x) {
    let a = Math.floor(x), f = x - a;
    return Math.abs(f - __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 29)) < __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 30) ? a % __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 31) ? a + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 32) : a : Math.round(x);
  }
  function fee(f, n, p) {
    let raw = f.coefficient * n * p * (__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 33) - p);
    let paid = f.rounding === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 34) ? roundEven(raw * __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 35)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 36) : f.rounding === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 37) ? Math.floor(raw * __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 38) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 39) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 40)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 41) : Math.ceil((raw + n * p) * __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 42) - __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 43)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 44) - n * p;
    let credit = f.credit_fraction != null ? paid * f.credit_fraction : f.rounding === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 45) ? roundEven(f.maker_credit_coefficient * n * p * (__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 46) - p) * __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 47)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 48) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 49);
    return {
      paid,
      credit,
      remaining: paid - credit
    };
  }
  function download(name, text, type) {
    const u = URL.createObjectURL(new Blob([text], {
      type
    }));
    const a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 50));
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 51));
  }
  function exportVolume() {
    const rows = [[__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 52), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 53), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 54), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 55), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 56), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 57), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 58), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 59), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 60)]];
    for (const w of d.weeks) for (const [v, x] of Object.entries(w.volumes_m)) rows.push([w.start, w.end, v, x, w.derived.includes(v) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 61) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 62), w.source, w.published, d.checked_at, __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 63)]);
    download(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 64), rows.map(r => r.map(csvCell).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 65))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 66)), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 67));
  }
  function latestCSV() {
    const x = d.current_snapshot, rows = [[__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 68), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 69), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 70), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 71), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 72), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 73), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 74), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 75)]];
    for (const v of x.rows) rows.push([v.reporting_date, x.timezone, v.venue, v.volume_m, v.dollars_paid_m, x.status, v.source, x.retrieved_at]);
    download(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 76) + x.period + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 77), rows.map(r => r.map(csvCell).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 78))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 79)), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 80));
  }
  function latest() {
    const x = d.current_snapshot;
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 81) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.period)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 82) + __MARKET_STRUCTURE_RUNTIME__.template(x.rows.map(v => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 83) + __MARKET_STRUCTURE_RUNTIME__.template(v.source) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 84) + __MARKET_STRUCTURE_RUNTIME__.template(e(v.venue)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 85) + __MARKET_STRUCTURE_RUNTIME__.template(e(v.raw_volume)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 86) + __MARKET_STRUCTURE_RUNTIME__.template(e(v.raw_dollars_paid)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 87) + __MARKET_STRUCTURE_RUNTIME__.template(v.seven_day_volume_m == null ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 88) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 89) + bn(v.seven_day_volume_m)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 90)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 91))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 92) + __MARKET_STRUCTURE_RUNTIME__.template(x.methodology_url) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 93) + __MARKET_STRUCTURE_RUNTIME__.template(x.source_url) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 94);
  }
  function sources() {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 95) + __MARKET_STRUCTURE_RUNTIME__.template(e(d.volume_unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 96) + __MARKET_STRUCTURE_RUNTIME__.template(d.comparability.map(x => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 97) + __MARKET_STRUCTURE_RUNTIME__.template(e(x)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 98)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 99))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 100) + __MARKET_STRUCTURE_RUNTIME__.template(d.weeks.map((w, i) => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 101) + __MARKET_STRUCTURE_RUNTIME__.template(w.source) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 102) + __MARKET_STRUCTURE_RUNTIME__.template(i + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 103)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 104) + __MARKET_STRUCTURE_RUNTIME__.template(w.start) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 105) + __MARKET_STRUCTURE_RUNTIME__.template(w.end) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 106)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 107))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 108) + __MARKET_STRUCTURE_RUNTIME__.template(d.article) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 109) + __MARKET_STRUCTURE_RUNTIME__.template(e(d.validation.source_recency)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 110);
  }
  function chart() {
    const points = d.weeks.map((w, i) => ({
      w,
      i,
      v: w.volumes_m[venue]
    })).filter(p => p.v != null);
    const max = Math.max(...points.map(p => p.v), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 111));
    const y = v => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 112) - v / max * __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 113), x = i => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 114) + i * __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 115);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 116) + __MARKET_STRUCTURE_RUNTIME__.template(e(venue)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 117) + __MARKET_STRUCTURE_RUNTIME__.template(points.map((p, j) => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 118) + __MARKET_STRUCTURE_RUNTIME__.template(j && p.i === points[j - __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 119)].i + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 120) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 121) + __MARKET_STRUCTURE_RUNTIME__.template(x(points[j - __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 122)].i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 123) + __MARKET_STRUCTURE_RUNTIME__.template(y(points[j - __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 124)].v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 125) + __MARKET_STRUCTURE_RUNTIME__.template(x(p.i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 126) + __MARKET_STRUCTURE_RUNTIME__.template(y(p.v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 127) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 128)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 129) + __MARKET_STRUCTURE_RUNTIME__.template(x(p.i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 130) + __MARKET_STRUCTURE_RUNTIME__.template(y(p.v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 131) + __MARKET_STRUCTURE_RUNTIME__.template(x(p.i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 132) + __MARKET_STRUCTURE_RUNTIME__.template(y(p.v) - __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 133)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 134) + __MARKET_STRUCTURE_RUNTIME__.template(p.w.derived.includes(venue) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 135) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 136)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 137) + __MARKET_STRUCTURE_RUNTIME__.template(bn(p.v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 138)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 139))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 140) + __MARKET_STRUCTURE_RUNTIME__.template(d.weeks.map((w, i) => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 141) + __MARKET_STRUCTURE_RUNTIME__.template(x(i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 142) + __MARKET_STRUCTURE_RUNTIME__.template(w.end.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 143))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 144)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 145))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 146);
  }
  function volumes() {
    const w = d.weeks[week], last = r.daily.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 147)), s = r.summary;
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 148) + __MARKET_STRUCTURE_RUNTIME__.template(latest()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 149) + __MARKET_STRUCTURE_RUNTIME__.template(brokerReport()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 150) + __MARKET_STRUCTURE_RUNTIME__.template(d.weeks.map((x, i) => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 151) + __MARKET_STRUCTURE_RUNTIME__.template(i) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 152) + __MARKET_STRUCTURE_RUNTIME__.template(i === week ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 153) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 154)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 155) + __MARKET_STRUCTURE_RUNTIME__.template(x.end) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 156)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 157))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 158) + __MARKET_STRUCTURE_RUNTIME__.template([__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 159), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 160), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 161), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 162), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 163), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 164), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 165)].map(v => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 166) + __MARKET_STRUCTURE_RUNTIME__.template(v === venue ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 167) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 168)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 169) + __MARKET_STRUCTURE_RUNTIME__.template(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 170)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 171))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 172) + __MARKET_STRUCTURE_RUNTIME__.template(chart()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 173) + __MARKET_STRUCTURE_RUNTIME__.template(Object.entries(w.volumes_m).sort((a, b) => b[__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 174)] - a[__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 175)]).map(([v, x]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 176) + __MARKET_STRUCTURE_RUNTIME__.template(e(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 177) + __MARKET_STRUCTURE_RUNTIME__.template(w.derived.includes(v) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 178) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 179)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 180) + __MARKET_STRUCTURE_RUNTIME__.template(bn(x)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 181) + __MARKET_STRUCTURE_RUNTIME__.template(w.derived.includes(v) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 182) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 183)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 184)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 185))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 186) + __MARKET_STRUCTURE_RUNTIME__.template(w.kalshi_regulated_share != null ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 187) + __MARKET_STRUCTURE_RUNTIME__.template(w.kalshi_regulated_share) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 188) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 189)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 190) + __MARKET_STRUCTURE_RUNTIME__.template(w.source) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 191) + __MARKET_STRUCTURE_RUNTIME__.template(w.published) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 192) + __MARKET_STRUCTURE_RUNTIME__.template(e(w.calculation || __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 193))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 194) + __MARKET_STRUCTURE_RUNTIME__.template(last.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 195) + __MARKET_STRUCTURE_RUNTIME__.template(s.calendar_days) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 196) + __MARKET_STRUCTURE_RUNTIME__.template([[__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 197), last.volume], [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 198), s.latest_complete_7_day_adv], [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 199), s.september_adv_through_cutoff], [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 200), last.oi]].map(([k, v]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 201) + __MARKET_STRUCTURE_RUNTIME__.template(k) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 202) + __MARKET_STRUCTURE_RUNTIME__.template((v / __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 203)).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 204))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 205) + __MARKET_STRUCTURE_RUNTIME__.template(k.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 206)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 207) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 208)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 209)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 210))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 211) + __MARKET_STRUCTURE_RUNTIME__.template(sources()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 212);
  }
  function brokerMetric(key) {
    return d.broker_reports.metrics.find(x => x.id === key);
  }
  function brokerValue(m, index) {
    const o = m.observations.find(x => x.report_date === d.broker_reports.reports[index].publication_date);
    if (!o) return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 213);
    const x = o.value;
    if (m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 214)) return x + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 215);
    if (m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 216)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 217) + x.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 218)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 219);
    if (m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 220)) return x < __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 221) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 222) + Math.round(x * __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 223)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 224) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 225) + x.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 226)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 227);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 228) + x + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 229);
  }
  function brokerLink(index, page) {
    const x = d.broker_reports.reports[index];
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 230) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 231) + __MARKET_STRUCTURE_RUNTIME__.template(page) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 232) + __MARKET_STRUCTURE_RUNTIME__.template(x.publication_date.slice(-__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 233))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 234) + __MARKET_STRUCTURE_RUNTIME__.template(page) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 235);
  }
  function brokerTable(ids, changes = false) {
    const delta = {
      combined_weekly_volume: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 236),
      hood_net_revenue: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 237),
      hood_kalshi_share: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 238),
      rothera_adv: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 239),
      cme_event_adv: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 240),
      forecastex_adv: __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 241)
    };
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 242) + __MARKET_STRUCTURE_RUNTIME__.template(changes ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 243) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 244)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 245) + __MARKET_STRUCTURE_RUNTIME__.template(ids.map(id => {
      const m = brokerMetric(id), links = m.observations.map(o => brokerLink(d.broker_reports.reports.findIndex(r => r.id === o.report_id), o.page)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 246));
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 247) + __MARKET_STRUCTURE_RUNTIME__.template(e(m.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 248) + __MARKET_STRUCTURE_RUNTIME__.template(e(m.window)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 249) + __MARKET_STRUCTURE_RUNTIME__.template(links) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 250) + __MARKET_STRUCTURE_RUNTIME__.template(brokerValue(m, __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 251))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 252) + __MARKET_STRUCTURE_RUNTIME__.template(brokerValue(m, __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 253))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 254) + __MARKET_STRUCTURE_RUNTIME__.template(changes ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 255) + __MARKET_STRUCTURE_RUNTIME__.template(e(delta[id] || __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 256))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 257) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 258)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 259);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 260))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 261);
  }
  function brokerSources() {
    const b = d.broker_reports;
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 262) + __MARKET_STRUCTURE_RUNTIME__.template(b.reports.map(x => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 263) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 264) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.publication_date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 265)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 266))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 267) + __MARKET_STRUCTURE_RUNTIME__.template(b.notes.map(x => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 268) + __MARKET_STRUCTURE_RUNTIME__.template(e(x)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 269)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 270))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 271);
  }
  function brokerReport() {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 272) + __MARKET_STRUCTURE_RUNTIME__.template(brokerLink(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 273), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 274))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 275) + __MARKET_STRUCTURE_RUNTIME__.template(brokerTable([__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 276), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 277), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 278), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 279), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 280), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 281)], true)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 282) + __MARKET_STRUCTURE_RUNTIME__.template(brokerTable([__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 283), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 284), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 285), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 286), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 287), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 288), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 289), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 290), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 291), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 292)])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 293) + __MARKET_STRUCTURE_RUNTIME__.template(brokerLink(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 294), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 295))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 296) + __MARKET_STRUCTURE_RUNTIME__.template(brokerLink(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 297), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 298))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 299) + __MARKET_STRUCTURE_RUNTIME__.template(brokerLink(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 300), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 301))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 302) + __MARKET_STRUCTURE_RUNTIME__.template(brokerSources()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 303);
  }
  function brokerCompany(t) {
    const b = d.broker_reports;
    if (!b.company_takeaways[t]) return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 304);
    const ids = t === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 305) ? [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 306), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 307), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 308), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 309), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 310)] : t === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 311) ? [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 312), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 313)] : [__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 314), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 315)];
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 316) + __MARKET_STRUCTURE_RUNTIME__.template(t === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 317) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 318) : t === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 319) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 320) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 321)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 322) + __MARKET_STRUCTURE_RUNTIME__.template(e(b.company_takeaways[t])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 323) + __MARKET_STRUCTURE_RUNTIME__.template(brokerLink(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 324), t === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 325) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 326) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 327))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 328) + __MARKET_STRUCTURE_RUNTIME__.template(brokerTable(ids)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 329) + __MARKET_STRUCTURE_RUNTIME__.template(t === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 330) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 331) : t === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 332) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 333) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 334)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 335) + __MARKET_STRUCTURE_RUNTIME__.template(brokerSources()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 336);
  }
  function exportBroker() {
    const b = d.broker_reports, rows = [[__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 337), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 338), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 339), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 340), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 341), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 342), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 343), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 344), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 345), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 346), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 347), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 348)]];
    for (const m of b.metrics) for (const o of m.observations) rows.push([m.id, m.label, o.value, m.unit, m.window, o.period_start, o.period_end, o.report_date, m.evidence, m.scope, o.page, o.url]);
    download(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 349), rows.map(x => x.map(csvCell).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 350))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 351)), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 352));
  }
  function economics() {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 353) + __MARKET_STRUCTURE_RUNTIME__.template(d.checked_at) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 354) + __MARKET_STRUCTURE_RUNTIME__.template(d.fees.map(f => __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 355) + __MARKET_STRUCTURE_RUNTIME__.template(e(f.venue + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 356) + f.product)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 357) + __MARKET_STRUCTURE_RUNTIME__.template(e(f.note)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 358) + __MARKET_STRUCTURE_RUNTIME__.template(e(f.effective)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 359) + __MARKET_STRUCTURE_RUNTIME__.template(f.source) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 360) + __MARKET_STRUCTURE_RUNTIME__.template(f.credit_source ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 361) + __MARKET_STRUCTURE_RUNTIME__.template(f.credit_source) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 362) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 363)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 364)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 365))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 366) + __MARKET_STRUCTURE_RUNTIME__.template(sources()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 367);
  }
  function calc() {
    const n = Number($p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 368)).value), c = Number($p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 369)).value);
    if (!Number.isInteger(n) || n < __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 370) || n > __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 371) || !Number.isInteger(c) || c < __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 372) || c > __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 373)) {
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 374)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 375);
      return;
    }
    const p = c / __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 376);
    $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 377)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 378) + __MARKET_STRUCTURE_RUNTIME__.template(d.fees.map(f => {
      const v = fee(f, n, p);
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 379) + __MARKET_STRUCTURE_RUNTIME__.template(e(f.venue)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 380) + __MARKET_STRUCTURE_RUNTIME__.template(e(f.product)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 381) + __MARKET_STRUCTURE_RUNTIME__.template(money(v.paid)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 382) + __MARKET_STRUCTURE_RUNTIME__.template(money(v.credit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 383) + __MARKET_STRUCTURE_RUNTIME__.template(money(v.remaining)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 384) + __MARKET_STRUCTURE_RUNTIME__.template(money(n * p + v.paid)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 385);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 386))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 387);
  }
  function render() {
    panel.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 388) + __MARKET_STRUCTURE_RUNTIME__.template(d.checked_at) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 389) + __MARKET_STRUCTURE_RUNTIME__.template(mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 390) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 391) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 392)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 393) + __MARKET_STRUCTURE_RUNTIME__.template(mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 394) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 395) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 396)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 397) + __MARKET_STRUCTURE_RUNTIME__.template(mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 398) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 399) : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 400)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 401) + __MARKET_STRUCTURE_RUNTIME__.template(mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 402) ? (window.MarketChartCover ? window.MarketChartCover.predictionHTML() : __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 403)) + volumes() : mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 404) ? economics() : window.PredictionExposure.overview()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 405);
    $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 406)).onclick = () => {
      mode = __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 407);
      render();
    };
    $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 408)).onclick = () => {
      mode = __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 409);
      render();
    };
    $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 410)).onclick = () => {
      mode = __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 411);
      render();
    };
    if (mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 412)) {
      window.PredictionExposure.bind(panel);
      return;
    }
    $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 413)).onclick = () => download(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 414), JSON.stringify(d, null, __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 415)), __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 416));
    if (mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 417)) {
      window.MarketChartCover?.bind(panel);
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 418)).onclick = latestCSV;
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 419)).onclick = exportBroker;
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 420)).onchange = ev => {
        week = +ev.target.value;
        render();
      };
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 421)).onchange = ev => {
        venue = ev.target.value;
        render();
      };
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 422)).onclick = exportVolume;
    } else {
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 423)).onclick = calc;
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 424)).oninput = calc;
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 425)).oninput = calc;
      calc();
    }
  }
  const previous = setTab;
  setTab = function (name, reset) {
    previous(name, reset);
    panel.hidden = name !== __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 426);
    if (name === __MARKET_STRUCTURE_RUNTIME__.literal("module-016", 427)) {
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 428)).open = false;
      $p(__MARKET_STRUCTURE_RUNTIME__.literal("module-016", 429)).hidden = true;
      render();
    }
  };
  window.PredictionMarkets = {
    data: d,
    fee,
    render,
    exportVolume,
    latestCSV,
    brokerCompany,
    brokerReport,
    exportBroker
  };
})();
