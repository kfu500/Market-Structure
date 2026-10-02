// Reviewed presentation code; literal content is supplied by private storage.
const DB = __MARKET_STRUCTURE_RUNTIME__.snapshot.components.DB;
const Analytics = __MARKET_STRUCTURE_RUNTIME__.analytics;
const VIEW_LABELS = {
  yoy: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 0),
  level: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1),
  mom: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 2),
  rolling: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 3),
  rolling_yoy: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 4),
  three_on_three: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 5),
  ttm_yoy: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 6),
  cagr: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 7)
};
function analysisMethod(def = spec(state.metric)) {
  if (def.family === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 8) || def.window_months === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 9)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 10);
  if (def.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 11)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 12);
  if (def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 13)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 14);
  if (def.days_basis === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 15)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 16);
  if (def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 17)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 18);
  if (def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 19)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 20);
  return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 21);
}
function periodUnit(def, n) {
  return def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 22) ? def.unit.replace(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 23), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 24) + n + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 25)) : def.unit;
}
function viewUnit(def, view = state.view) {
  return view === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 26) ? periodUnit(def, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 27)) : view === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 28) ? def.unit : def.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 29) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 30) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 31);
}
function analysisFormat(v, unit) {
  return [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 32), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 33)].includes(unit) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 34) + __MARKET_STRUCTURE_RUNTIME__.template(v >= __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 35) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 36) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 37)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 38) + __MARKET_STRUCTURE_RUNTIME__.template(v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 39))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 40) + __MARKET_STRUCTURE_RUNTIME__.template(unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 41) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 42) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 43)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 44) : fmt(v, unit);
}
function supportedViews(def) {
  const windowed = def.family === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 45) || def.window_months === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 46), stock = def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 47);
  return Object.keys(VIEW_LABELS).filter(v => !(stock && [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 48), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 49), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 50), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 51)].includes(v)) && !((windowed || def.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 52)) && [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 53), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 54), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 55), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 56)].includes(v)) && !(def.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 57) && v === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 58)));
}
function analysisRows(view = state.view) {
  return Analytics.transform(getSeries(state.metric), spec(state.metric), view).filter(p => month(p.date) >= state.from && month(p.date) <= state.to);
}
function lastComplete(key) {
  return visibleSeries(key).filter(Analytics.complete).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 59));
}
function trendChange(key, p) {
  return p ? Analytics.growth(getSeries(key), p.date, spec(key), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 60), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 61)) : null;
}
function acceleration(key, p) {
  if (!p) return null;
  const a = trendChange(key, p), b = Analytics.growth(getSeries(key), shiftMonth(p.date, -__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 62)), spec(key), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 63), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 64));
  return a && b ? {
    value: a.value - b.value,
    pp: true
  } : null;
}
function renderAnalytics() {
  const def = spec(state.metric), all = getSeries(state.metric), last = lastComplete(state.metric), supported = supportedViews(def);
  if (!supported.includes(state.view)) state.view = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 65);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 66)).innerHTML = supported.map(v => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 67) + __MARKET_STRUCTURE_RUNTIME__.template(state.view === v ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 68) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 69)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 70) + __MARKET_STRUCTURE_RUNTIME__.template(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 71) + __MARKET_STRUCTURE_RUNTIME__.template(state.view === v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 72) + __MARKET_STRUCTURE_RUNTIME__.template(VIEW_LABELS[v]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 73)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 74));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 75)).querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 76)).forEach(b => b.onclick = () => {
    state.view = b.dataset.view;
    render();
  });
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 77)).textContent = analysisMethod(def);
  const rows = analysisRows(), unit = viewUnit(def), lines = [{
    name: VIEW_LABELS[state.view],
    rows,
    color: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 78)
  }];
  if (state.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 79) && supported.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 80))) lines.push({
    name: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 81),
    rows: analysisRows(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 82)),
    color: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 83)
  });
  if (state.view === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 84) && supported.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 85))) lines.push({
    name: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 86),
    rows: analysisRows(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 87)),
    color: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 88)
  });
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 89)).textContent = (def.title || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 90)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 91) + VIEW_LABELS[state.view];
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 92)).textContent = def.description || profile().methodology;
  multiChart(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 93), lines, unit, def.frequency);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 94)).innerHTML = lines.map(l => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 95) + __MARKET_STRUCTURE_RUNTIME__.template(l.color) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 96) + __MARKET_STRUCTURE_RUNTIME__.template(esc(l.name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 97)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 98));
  const yr = last && compare(state.metric, last, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 99)), trend = trendChange(state.metric, last), acc = acceleration(state.metric, last);
  const windowed = def.family === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 100) || def.window_months === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 101) || def.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 102) || def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 103);
  const cards = [[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 104), fmt(last?.value, def.unit), periodLabel(last?.date, def.frequency)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 105), delta(yr), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 106)], [windowed ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 107) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 108), delta(windowed ? compare(state.metric, last, def.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 109) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 110) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 111)) : trend), windowed ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 112) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 113)], [def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 114) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 115) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 116), def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 117) ? fmt(Analytics.at(all, shiftMonth(last?.date || state.to, -__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 118)))?.value, def.unit) : delta(acc), def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 119) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 120) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 121)]];
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 122)).innerHTML = cards.map(([title, value, sub]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 123) + __MARKET_STRUCTURE_RUNTIME__.template(esc(title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 124) + __MARKET_STRUCTURE_RUNTIME__.template(value) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 125) + __MARKET_STRUCTURE_RUNTIME__.template(esc(sub)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 126)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 127));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 128)).textContent = qtdText(state.metric, last);
  const quarters = Analytics.quarters(all.filter(p => month(p.date) <= state.to), def).filter(p => month(p.date) >= state.from);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 129)).hidden = !quarters.length;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 130)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 131);
  const qrows = quarters.filter(p => p.growth).map(p => ({
    ...p,
    value: p.growth.value,
    raw: Analytics.at(all, p.date)
  }));
  multiChart(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 132), [{
    name: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 133),
    rows: qrows,
    color: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 134)
  }], def.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 135) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 136) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 137), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 138));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 139)).textContent = quarters.length ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 140) + analysisMethod(def) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 141);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 142)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 143) + __MARKET_STRUCTURE_RUNTIME__.template(quarters.slice(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 144)).reverse().map(q => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 145) + __MARKET_STRUCTURE_RUNTIME__.template(esc(q.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 146) + __MARKET_STRUCTURE_RUNTIME__.template(q.months) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 147) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(q.value, periodUnit(def, q.months))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 148) + __MARKET_STRUCTURE_RUNTIME__.template(esc(periodUnit(def, q.months))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 149) + __MARKET_STRUCTURE_RUNTIME__.template(delta(q.growth)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 150)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 151))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 152);
  renderSeasonality(all, def);
  renderHeatmap();
  renderContribution();
  renderResearchLens();
}
function multiChart(id, lines, unit, frequency = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 153), seasonal = false) {
  const el = $(id), pts = lines.flatMap(l => l.rows).filter(p => finite(p.value));
  if (!pts.length) {
    el.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 154);
    return;
  }
  const serial = d => seasonal ? +d.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 155), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 156)) : +d.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 157), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 158)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 159) + +d.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 160), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 161));
  const xlo = seasonal ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 162) : Math.min(...pts.map(p => serial(p.date))), xhi = seasonal ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 163) : Math.max(...pts.map(p => serial(p.date)));
  const w = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 164), h = id === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 165) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 166) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 167), left = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 168), right = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 169), top = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 170), bottom = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 171);
  let lo = Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 172), ...pts.map(p => p.value)), hi = Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 173), ...pts.map(p => p.value));
  const pad = (hi - lo || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 174)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 175);
  lo -= lo < __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 176) ? pad : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 177);
  hi += pad;
  const x = d => left + (w - left - right) * (xhi === xlo ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 178) : (serial(d) - xlo) / (xhi - xlo)), y = v => h - bottom - (h - top - bottom) * (v - lo) / (hi - lo);
  let svg = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 179) + __MARKET_STRUCTURE_RUNTIME__.template(w) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 180) + __MARKET_STRUCTURE_RUNTIME__.template(h) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 181) + __MARKET_STRUCTURE_RUNTIME__.template(esc(lines.map(l => l.name).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 182)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 183);
  for (let i = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 184); i < __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 185); i++) {
    const v = lo + (hi - lo) * i / __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 186);
    svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 187) + __MARKET_STRUCTURE_RUNTIME__.template(left) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 188) + __MARKET_STRUCTURE_RUNTIME__.template(w - right) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 189) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 190) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 191) + __MARKET_STRUCTURE_RUNTIME__.template(left - __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 192)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 193) + __MARKET_STRUCTURE_RUNTIME__.template(y(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 194)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 195) + __MARKET_STRUCTURE_RUNTIME__.template(esc(analysisFormat(v, unit))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 196);
  }
  if (lo < __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 197)) svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 198) + __MARKET_STRUCTURE_RUNTIME__.template(left) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 199) + __MARKET_STRUCTURE_RUNTIME__.template(w - right) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 200) + __MARKET_STRUCTURE_RUNTIME__.template(y(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 201))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 202) + __MARKET_STRUCTURE_RUNTIME__.template(y(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 203))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 204);
  const labels = seasonal ? Array.from({
    length: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 205)
  }, (_, i) => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 206) + __MARKET_STRUCTURE_RUNTIME__.template(String(i + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 207)).padStart(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 208), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 209))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 210)) : [...new Set(pts.map(p => month(p.date)))].sort().filter((d, i, a) => i === a.length - __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 211) || i % Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 212), Math.ceil(a.length / __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 213))) === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 214));
  labels.forEach(d => {
    svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 215) + __MARKET_STRUCTURE_RUNTIME__.template(x(d)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 216) + __MARKET_STRUCTURE_RUNTIME__.template(h - __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 217)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 218) + __MARKET_STRUCTURE_RUNTIME__.template(esc(seasonal ? periodLabel(d).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 219), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 220)) : periodLabel(d, frequency))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 221);
  });
  const clicks = [];
  lines.forEach(l => {
    let path = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 222);
    l.rows.forEach((p, i) => {
      if (!finite(p.value)) return;
      const prev = l.rows[i - __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 223)], step = frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 224) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 225) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 226), adj = prev && (seasonal ? serial(p.date) - serial(prev.date) === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 227) : shiftMonth(prev.date, step) === month(p.date));
      path += (adj ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 228) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 229)) + x(p.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 230) + y(p.value);
    });
    svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 231) + __MARKET_STRUCTURE_RUNTIME__.template(path) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 232) + __MARKET_STRUCTURE_RUNTIME__.template(l.color) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 233) + __MARKET_STRUCTURE_RUNTIME__.template(l.name.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 234)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 235) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 236)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 237);
    l.rows.forEach(p => {
      const idx = clicks.push(p) - __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 238);
      svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 239) + __MARKET_STRUCTURE_RUNTIME__.template(x(p.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 240) + __MARKET_STRUCTURE_RUNTIME__.template(y(p.value)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 241) + __MARKET_STRUCTURE_RUNTIME__.template(l.color) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 242) + __MARKET_STRUCTURE_RUNTIME__.template(x(p.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 243) + __MARKET_STRUCTURE_RUNTIME__.template(y(p.value)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 244) + __MARKET_STRUCTURE_RUNTIME__.template(idx) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 245) + __MARKET_STRUCTURE_RUNTIME__.template(esc(l.name + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 246) + periodLabel(p.date, frequency) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 247) + analysisFormat(p.value, unit))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 248) + __MARKET_STRUCTURE_RUNTIME__.template(esc(l.name + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 249) + periodLabel(p.date, frequency) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 250) + analysisFormat(p.value, unit))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 251);
    });
  });
  el.innerHTML = svg + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 252);
}
function renderSeasonality(all, def) {
  const done = all.filter(p => Analytics.complete(p) && month(p.date) <= state.to), years = [...new Set(done.map(p => p.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 253), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 254))))].slice(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 255)), colors = [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 256), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 257), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 258), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 259), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 260)];
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 261)).hidden = def.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 262);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 263)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 264);
  multiChart(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 265), years.map((yr, i) => ({
    name: yr,
    rows: done.filter(p => p.date.startsWith(yr)),
    color: colors[i]
  })), def.unit, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 266), true);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 267)).innerHTML = years.map((yr, i) => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 268) + __MARKET_STRUCTURE_RUNTIME__.template(colors[i]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 269) + __MARKET_STRUCTURE_RUNTIME__.template(yr) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 270)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 271));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 272)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 273);
}
function renderHeatmap() {
  const keys = availableKeys(), end = keys.flatMap(k => visibleSeries(k).filter(Analytics.complete).map(p => month(p.date))).sort().at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 274));
  const dates = end ? Array.from({
    length: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 275)
  }, (_, i) => shiftMonth(end, i - __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 276))).filter(d => d >= state.from) : [];
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 277)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 278) + __MARKET_STRUCTURE_RUNTIME__.template(dates.map(d => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 279) + __MARKET_STRUCTURE_RUNTIME__.template(esc(periodLabel(d))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 280)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 281))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 282) + __MARKET_STRUCTURE_RUNTIME__.template(keys.map(k => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 283) + __MARKET_STRUCTURE_RUNTIME__.template(esc(k)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 284) + __MARKET_STRUCTURE_RUNTIME__.template(esc(spec(k).title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 285) + __MARKET_STRUCTURE_RUNTIME__.template(dates.map(d => {
    const p = Analytics.at(getSeries(k), d), g = compare(k, p, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 286));
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 287) + __MARKET_STRUCTURE_RUNTIME__.template(!g ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 288) : g.value >= __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 289) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 290) + Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 291), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 292) + Math.abs(g.value) / __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 293)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 294) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 295) + Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 296), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 297) + Math.abs(g.value) / __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 298)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 299)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 300) + __MARKET_STRUCTURE_RUNTIME__.template(delta(g)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 301);
  }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 302))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 303)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 304))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 305);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 306)).querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 307)).forEach(b => {
    b.onclick = () => chooseMetric(b.dataset.metric);
    b.onkeydown = e => {
      if (e.key === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 308)) b.onclick();
    };
  });
}
function renderContribution() {
  const groups = state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 309) ? state.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 310) ? [[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 311), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 312), [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 313), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 314), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 315), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 316), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 317), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 318)]]] : state.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 319) ? [[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 320), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 321), [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 322), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 323), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 324), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 325)]]] : [] : [];
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 326)).hidden = !groups.length;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 327)).innerHTML = groups.map(([title, total, keys]) => {
    const p = lastComplete(total), prior = p && Analytics.at(getSeries(total), shiftMonth(p.date, -__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 328)));
    if (!Analytics.usable(p) || !Analytics.usable(prior) || prior.value <= __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 329)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 330);
    let sum = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 331);
    let missing = false;
    const rs = keys.map(k => {
      const a = Analytics.at(getSeries(k), p.date), b = Analytics.at(getSeries(k), prior.date);
      if (!Analytics.usable(a) || !Analytics.usable(b)) {
        missing = true;
        return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 332) + __MARKET_STRUCTURE_RUNTIME__.template(esc(spec(k).title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 333);
      }
      const c = (a.value - b.value) / prior.value * __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 334);
      sum += c;
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 335) + __MARKET_STRUCTURE_RUNTIME__.template(esc(spec(k).title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 336) + __MARKET_STRUCTURE_RUNTIME__.template((a.value / p.value * __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 337)).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 338))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 339) + __MARKET_STRUCTURE_RUNTIME__.template(delta(Analytics.change(a, b, spec(k).unit))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 340) + __MARKET_STRUCTURE_RUNTIME__.template(c >= __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 341) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 342) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 343)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 344) + __MARKET_STRUCTURE_RUNTIME__.template(c >= __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 345) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 346) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 347)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 348) + __MARKET_STRUCTURE_RUNTIME__.template(c.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 349))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 350);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 351));
    const growth = (p.value / prior.value - __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 352)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 353);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 354) + __MARKET_STRUCTURE_RUNTIME__.template(esc(title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 355) + __MARKET_STRUCTURE_RUNTIME__.template(esc(periodLabel(p.date))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 356) + __MARKET_STRUCTURE_RUNTIME__.template(rs) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 357) + __MARKET_STRUCTURE_RUNTIME__.template(missing ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 358) : (growth - sum).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 359)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 360)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 361) + __MARKET_STRUCTURE_RUNTIME__.template(growth.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 362))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 363);
  }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 364));
}
function renderResearchLens() {
  const p = profile(), lens = p.research_lens;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 365)).hidden = !lens;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 366)).innerHTML = lens ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 367) + __MARKET_STRUCTURE_RUNTIME__.template(esc(lens.question)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 368) + __MARKET_STRUCTURE_RUNTIME__.template(esc(lens.test)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 369) + __MARKET_STRUCTURE_RUNTIME__.template(esc(lens.source)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 370) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 371);
}
function momentumPoint(key) {
  if (!state.momentumComparable) return lastComplete(key);
  return visibleSeries(key).filter(p => Analytics.usable(p) && compare(key, p, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 372))).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 373));
}
function renderMomentumTable(keys) {
  keys = keys.filter(k => spec(k).title.toLowerCase().includes($(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 374)).value.toLowerCase()));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 375)).textContent = state.momentumComparable ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 376) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 377);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 378)).textContent = state.momentumComparable ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 379) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 380);
  const blocked = keys.map(k => ({
    key: k,
    p: lastComplete(k)
  })).filter(x => x.p?.analysis_block);
  const reasons = [...new Set(blocked.map(x => x.p.analysis_block))];
  const cell = (d, reason = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 381)) => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 382) + __MARKET_STRUCTURE_RUNTIME__.template(deltaClass(d)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 383) + __MARKET_STRUCTURE_RUNTIME__.template(!d ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 384) + __MARKET_STRUCTURE_RUNTIME__.template(esc(reason || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 385))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 386) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 387)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 388) + __MARKET_STRUCTURE_RUNTIME__.template(!d && reason ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 389) : delta(d)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 390);
  const notice = blocked.length || state.momentumComparable ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 391) + __MARKET_STRUCTURE_RUNTIME__.template(state.momentumComparable ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 392) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 393) + __MARKET_STRUCTURE_RUNTIME__.template(blocked.length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 394) + __MARKET_STRUCTURE_RUNTIME__.template(reasons.map(esc).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 395))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 396)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 397) + __MARKET_STRUCTURE_RUNTIME__.template(state.momentumComparable ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 398) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 399)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 400) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 401);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 402)).innerHTML = keys.length ? notice + (__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 403) + __MARKET_STRUCTURE_RUNTIME__.template(keys.map(k => {
    const d = spec(k), p = momentumPoint(k), latest = lastComplete(k), base = p && Analytics.at(getSeries(k), shiftMonth(p.date, -__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 404))), reason = p?.analysis_block || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 405), earlier = p && latest && p.date !== latest.date;
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 406) + __MARKET_STRUCTURE_RUNTIME__.template(k === state.metric ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 407) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 408)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 409) + __MARKET_STRUCTURE_RUNTIME__.template(esc(k)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 410) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 411) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 412) + __MARKET_STRUCTURE_RUNTIME__.template(esc(periodLabel(p?.date, d.frequency))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 413) + __MARKET_STRUCTURE_RUNTIME__.template(reason ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 414) : earlier ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 415) + __MARKET_STRUCTURE_RUNTIME__.template(esc(periodLabel(latest.date, d.frequency))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 416) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 417)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 418) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(p?.value, d.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 419) + __MARKET_STRUCTURE_RUNTIME__.template(cell(compare(k, p, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 420)), reason)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 421) + __MARKET_STRUCTURE_RUNTIME__.template(cell(compare(k, p, d.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 422) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 423) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 424)), reason)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 425) + __MARKET_STRUCTURE_RUNTIME__.template(cell(trendChange(k, p), reason)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 426) + __MARKET_STRUCTURE_RUNTIME__.template(cell(acceleration(k, p), reason)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 427) + __MARKET_STRUCTURE_RUNTIME__.template(cell(compare(k, base, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 428)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 429);
  }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 430))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 431)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 432);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 433)).querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 434))?.addEventListener(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 435), () => {
    state.momentumComparable = !state.momentumComparable;
    renderMomentumTable(availableKeys());
  });
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 436)).querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 437)).forEach(b => {
    b.onclick = () => chooseMetric(b.dataset.metric);
    b.onkeydown = e => {
      if (e.key === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 438)) b.onclick();
    };
  });
}
__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 439);
function latestRefreshSourceList(info, table) {
  const sources = table?.sources?.length ? table.sources : info.sources || [];
  return sources.filter(source => source && source.title);
}
function latestRefreshCSV(info, table) {
  const sources = latestRefreshSourceList(info, table);
  const columns = table.columns || [];
  const headers = [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 440), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 441), ...columns.map(column => column.key), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 442), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 443), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 444), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 445), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 446), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 447), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 448), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 449), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 450), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 451)];
  const rows = (table.rows || []).map(row => [state.company, table.title, ...columns.map(column => row[column.key]), row.as_of || table.as_of || info.as_of || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 452), row.scope || table.scope || info.scope || table.title, row.period_status || table.period_status || info.period_status || info.status, info.checked_at || DB.refresh.checked_at, row.unit || table.unit || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 453), row.days || table.days || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 454), row.source_document || sources.map(source => source.title).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 455)), row.source_url || sources.map(source => source.url || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 456)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 457)), row.source_location || table.source_location || sources.map(source => source.location || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 458)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 459)), row.note || table.note || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 460)]);
  return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 461) + [headers, ...rows].map(row => row.map(csvCell).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 462))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 463));
}
function downloadLatestRefreshTable(info, table, index) {
  const url = URL.createObjectURL(new Blob([latestRefreshCSV(info, table)], {
    type: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 464)
  }));
  const link = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 465));
  link.href = url;
  link.download = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 466) + __MARKET_STRUCTURE_RUNTIME__.template(state.company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 467) + __MARKET_STRUCTURE_RUNTIME__.template(info.checked_at || DB.refresh.checked_at) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 468) + __MARKET_STRUCTURE_RUNTIME__.template(index + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 469)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 470);
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 471));
}
function latestRefreshCell(value, column) {
  if (value == null || value === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 472)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 473);
  if (column.numeric && typeof value === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 474) && Number.isFinite(value)) {
    return esc(value.toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 475), {
      maximumFractionDigits: column.decimals ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 476)
    }));
  }
  return esc(value);
}
function renderLatestRefresh() {
  const panel = $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 477));
  const info = DB.refresh?.companies?.[state.company];
  if (!panel) return;
  panel.hidden = !info;
  if (!info) {
    panel.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 478);
    return;
  }
  const tables = (info.tables || []).filter(table => table.columns?.length && table.rows?.length);
  const sources = latestRefreshSourceList(info);
  const statusClass = new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 479), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 480)).test(info.status || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 481)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 482) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 483);
  panel.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 484) + __MARKET_STRUCTURE_RUNTIME__.template(esc(info.checked_at || DB.refresh.checked_at)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 485) + __MARKET_STRUCTURE_RUNTIME__.template(esc(info.headline || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 486))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 487) + __MARKET_STRUCTURE_RUNTIME__.template(statusClass) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 488) + __MARKET_STRUCTURE_RUNTIME__.template(esc(info.status || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 489))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 490) + __MARKET_STRUCTURE_RUNTIME__.template(info.summary ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 491) + __MARKET_STRUCTURE_RUNTIME__.template(esc(info.summary)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 492) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 493)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 494) + __MARKET_STRUCTURE_RUNTIME__.template(info.history_note ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 495) + __MARKET_STRUCTURE_RUNTIME__.template(esc(info.history_note)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 496) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 497)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 498) + __MARKET_STRUCTURE_RUNTIME__.template(!tables.length && !info.summary ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 499) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 500)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 501) + __MARKET_STRUCTURE_RUNTIME__.template(tables.map((table, index) => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 502) + __MARKET_STRUCTURE_RUNTIME__.template(esc(table.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 503) + __MARKET_STRUCTURE_RUNTIME__.template(table.as_of || table.scope || table.period_status ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 504) + __MARKET_STRUCTURE_RUNTIME__.template(esc([table.as_of && __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 505) + table.as_of, table.scope, table.period_status].filter(Boolean).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 506)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 507) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 508)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 509) + __MARKET_STRUCTURE_RUNTIME__.template(table.columns.map(column => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 510) + __MARKET_STRUCTURE_RUNTIME__.template(column.numeric ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 511) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 512)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 513) + __MARKET_STRUCTURE_RUNTIME__.template(esc(column.label || column.key)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 514)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 515))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 516) + __MARKET_STRUCTURE_RUNTIME__.template(table.rows.map(row => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 517) + __MARKET_STRUCTURE_RUNTIME__.template(table.columns.map(column => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 518) + __MARKET_STRUCTURE_RUNTIME__.template(column.numeric ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 519) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 520)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 521) + __MARKET_STRUCTURE_RUNTIME__.template(latestRefreshCell(row[column.key], column)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 522)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 523))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 524)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 525))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 526) + __MARKET_STRUCTURE_RUNTIME__.template(table.note ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 527) + __MARKET_STRUCTURE_RUNTIME__.template(esc(table.note)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 528) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 529)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 530) + __MARKET_STRUCTURE_RUNTIME__.template(index) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 531)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 532))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 533) + __MARKET_STRUCTURE_RUNTIME__.template(sources.length ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 534) + __MARKET_STRUCTURE_RUNTIME__.template(sources.map(source => new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 535), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 536)).test(source.url || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 537)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 538) + __MARKET_STRUCTURE_RUNTIME__.template(esc(source.url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 539) + __MARKET_STRUCTURE_RUNTIME__.template(esc(source.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 540) + __MARKET_STRUCTURE_RUNTIME__.template(source.location ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 541) + esc(source.location) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 542)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 543) : esc(source.title) + (source.location ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 544) + esc(source.location) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 545))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 546))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 547) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 548)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 549);
  panel.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 550)).forEach(button => {
    const index = Number(button.dataset.refreshTable);
    button.onclick = () => downloadLatestRefreshTable(info, tables[index], index);
  });
}
__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 551);
const $ = id => document.getElementById(id);
const esc = s => String(s ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 552)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 553), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 554)), c => ({
  [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 555)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 556),
  [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 557)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 558),
  [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 559)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 560),
  [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 561)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 562),
  [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 563)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 564)
})[c]);
const finite = v => typeof v === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 565) && Number.isFinite(v);
const month = s => s.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 566), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 567));
function shiftMonth(s, n) {
  const [y, m] = month(s).split(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 568)).map(Number);
  return new Date(Date.UTC(y, m - __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 569) + n, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 570))).toISOString().slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 571), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 572));
}
const state = {
  company: DB.default_company || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 573),
  tab: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 574),
  metric: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 575),
  from: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 576),
  to: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 577),
  view: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 578)
};
const profile = () => DB.profiles[state.company];
function spec(key) {
  return profile().metric_meta?.[key] || ({
    title: Object.keys(profile().metrics).find(t => profile().metrics[t][__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 579)] === key) || key,
    unit: Object.values(profile().metrics).find(m => m[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 580)] === key)?.[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 581)] || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 582),
    frequency: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 583),
    family: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 584),
    description: profile().methodology
  });
}
function periodLabel(date, frequency = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 585)) {
  if (!date) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 586);
  if (frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 587)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 588) + __MARKET_STRUCTURE_RUNTIME__.template(Math.ceil(+date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 589), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 590)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 591))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 592) + __MARKET_STRUCTURE_RUNTIME__.template(date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 593), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 594))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 595);
  return new Date(month(date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 596)).toLocaleDateString(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 597), {
    month: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 598),
    year: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 599),
    timeZone: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 600)
  });
}
function fmt(v, unit = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 601), digits) {
  if (!finite(v)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 602);
  if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 603)) return (v * __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 604)).toFixed(digits ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 605)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 606);
  if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 607) || unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 608)) return (v / __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 609)).toFixed(digits ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 610)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 611);
  if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 612) || unit.startsWith(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 613)) || unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 614)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 615) + v.toFixed(digits ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 616));
  if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 617)) return v.toFixed(digits ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 618));
  if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 619)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 620) + v.toFixed(digits ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 621)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 622);
  if (unit.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 623))) return (v / __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 624)).toFixed(digits ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 625)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 626);
  return v.toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 627), {
    minimumFractionDigits: digits ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 628),
    maximumFractionDigits: digits ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 629)
  });
}
const genericSeriesCache = new Map();
function getSeries(key) {
  const p = profile();
  if (p.series) return p.series[key] || [];
  const cacheKey = state.company + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 630) + key;
  if (genericSeriesCache.has(cacheKey)) return genericSeriesCache.get(cacheKey);
  const last = p.data.map(r => month(r.date)).sort().at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 631));
  const result = p.data.filter(r => finite(r[key])).map(r => ({
    date: r.date,
    value: r[key],
    unit: spec(key).unit,
    period_status: r.period_status || (month(r.date) === last && p.latest.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 632)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 633) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 634)),
    classification: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 635),
    source_document: p.source,
    source_location: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 636),
    source_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 637),
    validation: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 638),
    days: r[key + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 639)] ?? null,
    calculation: p.methodology
  })).sort((a, b) => a.date.localeCompare(b.date));
  genericSeriesCache.set(cacheKey, result);
  return result;
}
const TAB_FAMILIES = {
  rpc: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 640),
  datavantage: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 641),
  collateral: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 642),
  cashmarkets: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 643),
  openinterest: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 644),
  customers: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 645),
  revenue: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 646),
  recurring: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 647),
  mortgage: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 648),
  indexdata: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 649),
  micros: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 650),
  pricing: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 651),
  industry: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 652),
  dailybasis: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 653)
};
function availableKeys() {
  return Object.values(profile().metrics).map(x => x[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 654)]).filter(k => {
    const f = spec(k).family;
    return TAB_FAMILIES[state.tab] ? f === TAB_FAMILIES[state.tab] : !Object.values(TAB_FAMILIES).includes(f);
  });
}
const visibleSeries = (key = state.metric) => getSeries(key).filter(r => month(r.date) >= state.from && month(r.date) <= state.to);
const lastPoint = key => visibleSeries(key).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 655));
const partial = p => !!p && new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 656), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 657)).test(p.period_status || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 658));
function compare(key, p, offset) {
  return Analytics.usable(p) ? Analytics.growth(getSeries(key), p.date, spec(key), offset) : null;
}
const delta = d => d && finite(d.value) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 659) + __MARKET_STRUCTURE_RUNTIME__.template(d.value >= __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 660) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 661) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 662)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 663) + __MARKET_STRUCTURE_RUNTIME__.template(d.value.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 664))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 665) + __MARKET_STRUCTURE_RUNTIME__.template(d.pp ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 666) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 667)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 668) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 669);
const deltaClass = d => !d ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 670) : d.value >= __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 671) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 672) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 673);
function familyEnd(keys) {
  const ds = keys.flatMap(k => getSeries(k).map(p => month(p.date))).sort();
  return {
    first: ds[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 674)] || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 675),
    last: ds.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 676)) || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 677)
  };
}
function setupCompany() {
  document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 678)).forEach(b => {
    const family = TAB_FAMILIES[b.dataset.tab];
    b.hidden = !!family && !Object.values(profile().metric_meta || ({})).some(d => d.family === family) || b.dataset.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 679) && !profile().guidance || b.dataset.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 680) && state.company !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 681);
  });
  document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 682)).forEach(b => {
    b.classList.toggle(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 683), b.dataset.company === state.company);
    b.setAttribute(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 684), b.dataset.company === state.company ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 685) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 686));
  });
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 687)).textContent = profile().name;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 688)).textContent = state.company + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 689);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 690)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 691);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 692)).textContent = profile().latest;
  const historicalStatus = state.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 693) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 694) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 695);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 696)).textContent = DB.refresh?.companies?.[state.company] ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 697) + DB.refresh.checked_at + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 698) : historicalStatus;
  if (typeof renderLatestRefresh === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 699)) renderLatestRefresh();
  setTab(window.CompanyContext ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 700) : window.BusinessDrivers ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 701) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 702), true);
}
function setTab(tab, reset = false) {
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 703)).hidden = tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 704);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 705)).hidden = tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 706);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 707)).hidden = tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 708) || tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 709);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 710)).hidden = $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 711)).hidden;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 712)).open = ![__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 713), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 714), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 715), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 716), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 717)].includes(tab);
  if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 718)) window.CompanyContext?.render(state.company);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 719)).hidden = tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 720);
  if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 721)) window.BusinessDrivers?.render(state.company);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 722)).hidden = tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 723);
  if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 724)) window.AnalysisPlaybook?.render(state.company);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 725)).hidden = tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 726);
  if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 727)) window.CompetitionTracker?.render();
  state.tab = tab;
  document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 728)).forEach(b => {
    b.classList.toggle(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 729), b.dataset.tab === tab);
    b.setAttribute(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 730), b.dataset.tab === tab ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 731) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 732));
  });
  const work = tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 733) || Object.keys(TAB_FAMILIES).includes(tab);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 734)).hidden = !work;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 735)).hidden = ![__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 736), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 737), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 738)].includes(tab);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 739)).hidden = tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 740);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 741)).hidden = tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 742);
  if (!work) {
    if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 743)) {
      renderResearch();
      if (window.BusinessDrivers) $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 744)).insertAdjacentHTML(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 745), window.BusinessDrivers.contextHTML(state.company));
    }
    if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 746)) renderGuidance();
    if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 747)) renderBrief();
    if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 748)) renderSources();
    return;
  }
  const keys = availableKeys();
  if (!keys.includes(state.metric) || reset) state.metric = keys[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 749)] || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 750);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 751)).innerHTML = keys.map(k => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 752) + __MARKET_STRUCTURE_RUNTIME__.template(esc(k)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 753) + __MARKET_STRUCTURE_RUNTIME__.template(esc(spec(k).title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 754)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 755));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 756)).value = state.metric;
  const range = familyEnd(keys);
  state.to = range.last;
  state.from = range.first && range.last ? [range.first, shiftMonth(range.last, -__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 757))].sort().at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 758)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 759);
  syncRange();
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 760)).value = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 761);
  render();
}
function syncRange() {
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 762)).value = state.from;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 763)).value = state.to;
}
function chooseMetric(key) {
  state.metric = key;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 764)).value = key;
  render();
}
function render() {
  const keys = availableKeys(), rows = visibleSeries(), def = spec(state.metric), last = rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 765));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 766)).textContent = state.from && state.to && state.from > state.to ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 767) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 768);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 769)).disabled = !rows.length;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 770)).disabled = !keys.length;
  const labels = {
    overview: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 771),
    rpc: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 772),
    datavantage: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 773),
    cashmarkets: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 774),
    openinterest: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 775),
    collateral: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 776)
  };
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 777)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 778) + __MARKET_STRUCTURE_RUNTIME__.template(esc(labels[state.tab] || TAB_FAMILIES[state.tab])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 779);
  const coverage = profile().coverage?.[state.metric];
  if (coverage) $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 780)).innerHTML += __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 781) + esc(coverage.first) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 782) + esc(coverage.last) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 783) + coverage.observations + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 784) + coverage.missing_periods.length + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 785);
  let note = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 786);
  if (state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 787)) note = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 788);
  if (state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 789)) note = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 790);
  if (profile().proxy_needed) note = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 791);
  if (partial(last)) note = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 792);
  if (state.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 793) && state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 794)) note += __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 795);
  const reviewed = lastComplete(state.metric);
  if (reviewed?.analysis_block) note += __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 796) + reviewed.analysis_block + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 797);
  if (def.scope_note) note += __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 798) + def.scope_note;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 799)).hidden = !note;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 800)).textContent = note;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 801)).textContent = def.title || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 802);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 803)).textContent = def.description || profile().methodology;
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 804)).textContent = def.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 805) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 806) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 807);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 808)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 809) + __MARKET_STRUCTURE_RUNTIME__.template(esc(def.unit || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 810))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 811);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 812)).textContent = qtdText(state.metric, last);
  renderProductTable(keys);
  renderHistory(rows);
  renderAnalytics();
  renderTakeaway();
}
function renderCards(keys) {
  let cards = state.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 813) ? state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 814) ? [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 815), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 816), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 817)] : state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 818) ? [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 819), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 820), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 821), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 822)] : [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 823), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 824), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 825), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 826)] : keys.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 827), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 828));
  cards = cards.filter(k => keys.includes(k));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 829)).innerHTML = cards.map(k => {
    const d = spec(k), p = lastPoint(k), y = compare(k, p, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 830));
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 831) + __MARKET_STRUCTURE_RUNTIME__.template(k === state.metric ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 832) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 833)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 834) + __MARKET_STRUCTURE_RUNTIME__.template(esc(k)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 835) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 836) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(p?.value, d.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 837) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 838) + __MARKET_STRUCTURE_RUNTIME__.template(deltaClass(y)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 839) + __MARKET_STRUCTURE_RUNTIME__.template(delta(y)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 840) + __MARKET_STRUCTURE_RUNTIME__.template(esc(periodLabel(p?.date, d.frequency))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 841);
  }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 842));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 843)).querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 844)).forEach(b => b.onclick = () => chooseMetric(b.dataset.metric));
}
function qtdText(key, last) {
  if (!last) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 845);
  const def = spec(key);
  if (last.analysis_block) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 846) + last.analysis_block;
  const q = Analytics.quarter(getSeries(key), last.date, def);
  return q ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 847) + __MARKET_STRUCTURE_RUNTIME__.template(q.label) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 848) + __MARKET_STRUCTURE_RUNTIME__.template(periodLabel(last.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 849) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(q.value, periodUnit(def, q.months))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 850) + __MARKET_STRUCTURE_RUNTIME__.template(periodUnit(def, q.months)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 851) + __MARKET_STRUCTURE_RUNTIME__.template(q.days ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 852) + q.days + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 853) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 854)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 855) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 856);
}
function renderProductTable(keys) {
  renderMomentumTable(keys);
}
function renderHistory(rows) {
  const d = spec(state.metric);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 857)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 858) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 859) + __MARKET_STRUCTURE_RUNTIME__.template([...rows].reverse().map(p => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 860) + __MARKET_STRUCTURE_RUNTIME__.template(esc(periodLabel(p.date, d.frequency))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 861) + __MARKET_STRUCTURE_RUNTIME__.template(partial(p) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 862) + (p.as_of ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 863) + esc(p.as_of) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 864)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 865)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 866) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(p.value, d.unit, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 867))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 868) + __MARKET_STRUCTURE_RUNTIME__.template(delta(compare(state.metric, p, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 869)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 870) + __MARKET_STRUCTURE_RUNTIME__.template(delta(compare(state.metric, p, d.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 871) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 872) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 873)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 874)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 875))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 876);
}
function renderResearch() {
  const p = profile(), ds = p.debates || [{
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 877),
    view: p.debate,
    attribution: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 878),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 879),
    metric: Object.values(p.metrics)[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 880)]?.[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 881)]
  }];
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 882)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 883) + __MARKET_STRUCTURE_RUNTIME__.template(ds.map((d, i) => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 884) + __MARKET_STRUCTURE_RUNTIME__.template(String(i + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 885)).padStart(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 886), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 887))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 888) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 889) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.view)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 890) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.attribution)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 891) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.test)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 892) + __MARKET_STRUCTURE_RUNTIME__.template(d.metric ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 893) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.metric)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 894) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 895)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 896)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 897))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 898);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 899)).querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 900)).forEach(b => b.onclick = () => {
    const k = b.dataset.evidence, f = spec(k).family;
    setTab(Object.keys(TAB_FAMILIES).find(t => TAB_FAMILIES[t] === f) || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 901));
    chooseMetric(k);
  });
}
function renderSources() {
  const sources = new Map();
  for (const rows of Object.values(profile().series || ({}))) for (const p of rows) sources.set(p.source_document, {
    date: p.source_date,
    url: p.source_url
  });
  for (const source of DB.refresh?.companies?.[state.company]?.sources || []) sources.set(source.title, {
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 902) + DB.refresh.checked_at,
    url: source.url
  });
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 903)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 904) + __MARKET_STRUCTURE_RUNTIME__.template([...sources].map(([name, s]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 905) + __MARKET_STRUCTURE_RUNTIME__.template(s.url ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 906) + __MARKET_STRUCTURE_RUNTIME__.template(esc(s.url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 907) + __MARKET_STRUCTURE_RUNTIME__.template(esc(name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 908) : esc(name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 909) + __MARKET_STRUCTURE_RUNTIME__.template(esc(s.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 910)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 911))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 912) + __MARKET_STRUCTURE_RUNTIME__.template(Object.values(profile().metrics).map(([k, u]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 913) + __MARKET_STRUCTURE_RUNTIME__.template(esc(spec(k).title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 914) + __MARKET_STRUCTURE_RUNTIME__.template(esc(u)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 915) + __MARKET_STRUCTURE_RUNTIME__.template(esc(spec(k).frequency)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 916) + __MARKET_STRUCTURE_RUNTIME__.template(esc(spec(k).description)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 917)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 918))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 919);
}
function csvCell(v) {
  if (v == null) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 920);
  let s = String(v);
  if (typeof v === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 921) && new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 922), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 923)).test(s)) s = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 924) + s;
  return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 925) + s.replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 926), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 927)), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 928)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 929);
}
function exportCSV() {
  const rows = visibleSeries(), d = spec(state.metric), transformed = new Map(analysisRows().map(p => [month(p.date), p.value])), headers = [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 930), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 931), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 932), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 933), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 934), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 935), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 936), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 937), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 938), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 939), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 940), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 941), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 942), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 943), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 944), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 945), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 946), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 947), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 948), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 949), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 950), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 951), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 952), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 953), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 954), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 955), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 956), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 957), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 958), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 959), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 960), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 961), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 962)];
  return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 963) + [headers, ...rows.map(p => [state.company, d.title, p.date, p.value, d.unit, d.frequency, p.classification, p.period_status, p.days, p.source_document, p.source_location, p.source_date, p.validation, p.calculation, p.original_field, p.raw_value, p.retrieved_at, p.revision_status, p.official_value, p.source_url, p.provider_value, p.provider_source, p.provider_location, VIEW_LABELS[state.view], transformed.get(month(p.date)), viewUnit(d), analysisMethod(d), p.audit?.status, p.analysis_block, JSON.stringify(p.audit?.comparisons || []), p.as_of, JSON.stringify(p.previous_snapshot ?? null), JSON.stringify(p.source_comparison ?? null)])].map(r => r.map(csvCell).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 964))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 965));
}
$(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 966)).onclick = () => {
  if (!visibleSeries().length) return;
  const url = URL.createObjectURL(new Blob([exportCSV()], {
    type: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 967)
  })), a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 968));
  a.href = url;
  a.download = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 969) + __MARKET_STRUCTURE_RUNTIME__.template(state.company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 970) + __MARKET_STRUCTURE_RUNTIME__.template(state.metric.replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 971), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 972)), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 973))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 974) + __MARKET_STRUCTURE_RUNTIME__.template(state.from) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 975) + __MARKET_STRUCTURE_RUNTIME__.template(state.to) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 976);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 977));
};
$(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 978)).onchange = () => chooseMetric($(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 979)).value);
$(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 980)).onchange = () => {
  state.from = $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 981)).value;
  render();
};
$(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 982)).onchange = () => {
  state.to = $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 983)).value;
  render();
};
$(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 984)).onclick = () => {
  const r = familyEnd(availableKeys());
  state.from = r.first;
  state.to = r.last;
  syncRange();
  render();
};
$(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 985)).oninput = () => renderProductTable(availableKeys());
document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 986)).forEach(b => b.onclick = () => {
  const r = familyEnd(availableKeys());
  state.to = r.last;
  state.from = r.last ? [r.first, shiftMonth(r.last, -Number(b.dataset.range) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 987))].sort().at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 988)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 989);
  syncRange();
  render();
});
document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 990)).forEach(b => b.onclick = () => setTab(b.dataset.tab));
$(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 991)).innerHTML = Object.entries(DB.profiles).map(([ticker, p]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 992) + __MARKET_STRUCTURE_RUNTIME__.template(ticker) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 993) + __MARKET_STRUCTURE_RUNTIME__.template(ticker) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 994) + __MARKET_STRUCTURE_RUNTIME__.template(esc(p.name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 995)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 996));
$(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 997)).querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 998)).forEach(b => b.onclick = () => {
  state.company = b.dataset.company;
  setupCompany();
});
$(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 999)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1000) + DB.version + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1001) + new Date(DB.built_at).toLocaleDateString(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1002), {
  day: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1003),
  month: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1004),
  year: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1005),
  timeZone: __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1006)
});
setupCompany();
function evidenceButtons(container) {
  container.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1007)).forEach(b => b.onclick = () => {
    const key = b.dataset.evidence, f = spec(key).family;
    setTab(Object.keys(TAB_FAMILIES).find(t => TAB_FAMILIES[t] === f) || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1008));
    chooseMetric(key);
  });
}
function renderGuidance() {
  const items = (profile().guidance || []).filter(g => !new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1009), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1010)).test(g.status));
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1011)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1012) + items.map(g => __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1013) + esc(g.status) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1014) + esc(g.title) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1015) + esc(g.value) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1016) + esc(g.metric) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1017) + esc(g.detail) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1018) + esc(g.horizon) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1019) + esc(g.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1020) + (g.url ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1021) + esc(g.url) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1022) + esc(g.source) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1023) : esc(g.source)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1024) + esc(g.monitor) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1025) + esc(g.key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1026)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1027)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1028) + (items.length ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1029) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1030));
  evidenceButtons($(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1031)));
}
function operatingSentence(key) {
  const def = spec(key), p = lastComplete(key);
  if (!p) return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1032);
  const y = compare(key, p, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1033)), s = compare(key, p, def.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1034) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1035) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1036));
  return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1037) + __MARKET_STRUCTURE_RUNTIME__.template(def.title) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1038) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(p.value, def.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1039) + __MARKET_STRUCTURE_RUNTIME__.template(def.unit) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1040) + __MARKET_STRUCTURE_RUNTIME__.template(periodLabel(p.date, def.frequency)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1041) + __MARKET_STRUCTURE_RUNTIME__.template(y ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1042) + __MARKET_STRUCTURE_RUNTIME__.template(delta(y)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1043) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1044)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1045) + __MARKET_STRUCTURE_RUNTIME__.template(s ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1046) + __MARKET_STRUCTURE_RUNTIME__.template(delta(s)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1047) + __MARKET_STRUCTURE_RUNTIME__.template(def.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1048) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1049) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1050)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1051) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1052)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1053);
}
function renderTakeaway() {
  const key = state.metric, def = spec(key), p = lastComplete(key), trend = trendChange(key, p);
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1054)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1055) + __MARKET_STRUCTURE_RUNTIME__.template(esc(periodLabel(p?.date, def.frequency))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1056) + __MARKET_STRUCTURE_RUNTIME__.template(esc(operatingSentence(key) || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1057))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1058) + __MARKET_STRUCTURE_RUNTIME__.template(trend && def.frequency !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1059) && def.window_months !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1060) && def.aggregation !== __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1061) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1062) + __MARKET_STRUCTURE_RUNTIME__.template(delta(trend)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1063) + __MARKET_STRUCTURE_RUNTIME__.template(esc(def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1064) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1065) : def.aggregation === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1066) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1067) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1068))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1069) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1070)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1071) + __MARKET_STRUCTURE_RUNTIME__.template(esc(p?.source_document || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1072))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1073) + __MARKET_STRUCTURE_RUNTIME__.template(esc(p?.source_location || __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1074))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1075) + __MARKET_STRUCTURE_RUNTIME__.template(p?.source_url ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1076) + __MARKET_STRUCTURE_RUNTIME__.template(esc(p.source_url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1077) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1078)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1079) + __MARKET_STRUCTURE_RUNTIME__.template(p?.analysis_block ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1080) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1081)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1082);
}
const BRIEF_KEYS = {
  CME: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1083), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1084), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1085), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1086), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1087)],
  CBOE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1088), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1089), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1090), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1091), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1092), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1093), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1094)],
  ICE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1095), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1096), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1097), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1098), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1099), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1100)],
  HOOD: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1101), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1102), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1103), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1104), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1105), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1106), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1107)],
  NDAQ: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1108), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1109), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1110), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1111), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1112)],
  TW: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1113), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1114), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1115), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1116), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1117), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1118)]
};
const TESTS = {
  CME: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1119), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1120), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1121)],
  CBOE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1122), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1123), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1124)],
  ICE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1125), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1126), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1127)],
  HOOD: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1128), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1129), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1130)],
  NDAQ: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1131), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1132), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1133)],
  TW: [__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1134), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1135), __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1136)]
};
function renderBrief() {
  const keys = (BRIEF_KEYS[state.company] || []).filter(k => getSeries(k).length), test = TESTS[state.company];
  $(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1137)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1138) + __MARKET_STRUCTURE_RUNTIME__.template(esc(test[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1139)])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1140) + __MARKET_STRUCTURE_RUNTIME__.template(esc(test[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1141)])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1142) + __MARKET_STRUCTURE_RUNTIME__.template(esc(test[__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1143)])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1144) + __MARKET_STRUCTURE_RUNTIME__.template(keys.map(k => {
    const d = spec(k), p = getSeries(k).filter(Analytics.complete).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1145)), y = p && Analytics.growth(getSeries(k), p.date, d, __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1146)), q = p && Analytics.growth(getSeries(k), p.date, d, d.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1147) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1148) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1149));
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1150) + __MARKET_STRUCTURE_RUNTIME__.template(esc(periodLabel(p?.date, d.frequency))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1151) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1152) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(p?.value, d.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1153) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1154) + __MARKET_STRUCTURE_RUNTIME__.template(delta(y)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1155) + __MARKET_STRUCTURE_RUNTIME__.template(delta(q)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1156) + __MARKET_STRUCTURE_RUNTIME__.template(d.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1157) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1158) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1159)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1160) + __MARKET_STRUCTURE_RUNTIME__.template(p?.analysis_block ? __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1161) : __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1162)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1163) + __MARKET_STRUCTURE_RUNTIME__.template(esc(p?.source_document)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1164) + __MARKET_STRUCTURE_RUNTIME__.template(esc(p?.source_location)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1165) + __MARKET_STRUCTURE_RUNTIME__.template(esc(k)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1166);
  }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1167))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1168);
  evidenceButtons($(__MARKET_STRUCTURE_RUNTIME__.literal("module-001", 1169)));
}
