// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  "use strict";
  const data = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 0)).textContent);
  const esc = v => String(v ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 1)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 2), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 3)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 4)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 5),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 6)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 7),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 8)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 9),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 10)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 11),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 12)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 13)
  })[c]);
  const colors = [__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 14), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 15), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 16)];
  const finite = v => typeof v === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 17) && Number.isFinite(v);
  const pd = (date, frequency) => periodLabel(date, frequency || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 18));
  function rows(t, k) {
    return DB.profiles[t].series[k] || [];
  }
  function meta(t, k) {
    return DB.profiles[t].metric_meta[k] || ({});
  }
  function last(t, k) {
    return rows(t, k).filter(Analytics.usable).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 19));
  }
  function growth(t, k, p) {
    return p ? Analytics.growth(rows(t, k), p.date, meta(t, k), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 20)) : null;
  }
  function valueText(v, unit) {
    if (!finite(v)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 21);
    if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 22) || unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 23)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 24) + (v >= __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 25) ? (v / __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 26)).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 27)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 28) : v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 29)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 30));
    if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 31) || unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 32)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 33) + v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 34)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 35);
    if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 36)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 37) + (v >= __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 38) ? (v / __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 39)).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 40)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 41) : v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 42)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 43));
    if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 44)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 45) + v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 46));
    if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 47)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 48) + v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 49));
    if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 50) || unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 51) || unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 52)) return v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 53)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 54);
    if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 55)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 56) + v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 57)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 58);
    if (unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 59)) return (v >= __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 60) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 61) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 62)) + v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 63)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 64);
    return fmt(v, unit);
  }
  function cardState(t, c) {
    if (c.fixed) return {
      ...c.fixed,
      title: c.label,
      sub: c.note || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 65),
      fixed: true
    };
    const p = last(t, c.key), d = meta(t, c.key);
    if (!p) return {
      title: c.label,
      value: null,
      date: null,
      unit: d.unit,
      sub: __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 66)
    };
    const g = c.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 67) ? Analytics.growth(rows(t, c.key), p.date, d, __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 68), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 69)) : growth(t, c.key, p);
    return {
      title: c.label,
      value: c.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 70) ? g?.value : p.value,
      unit: c.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 71) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 72) : d.unit,
      date: p.date,
      frequency: d.frequency,
      delta: c.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 73) || c.noGrowth ? null : g,
      sub: c.reviewed_date && c.reviewed_date !== p.date ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 74) : c.note || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 75),
      source: p
    };
  }
  function chartRows(t, c, key) {
    const d = meta(t, key), rr = rows(t, key).filter(Analytics.usable);
    return rr.map(p => {
      const g = c.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 76) ? growth(t, key, p) : null;
      return {
        date: p.date,
        value: c.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 77) ? g?.value : p.value,
        source: p
      };
    }).filter(p => finite(p.value));
  }
  function barChart(t, c, cites) {
    let entries = c.values || [], period = c.period;
    if (c.type === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 78)) {
      const latest = last(t, c.totalKey || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 79));
      period = pd(latest?.date);
      entries = c.keys.map((k, i) => {
        const p = Analytics.at(rows(t, k), latest?.date || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 80)), b = p && Analytics.at(rows(t, k), Analytics.shift(p.date, -__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 81)));
        return {
          label: c.labels?.[i] || k,
          value: Analytics.usable(p) && Analytics.usable(b) ? (p.value - b.value) / __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 82) : null
        };
      });
    }
    const vals = entries.filter(x => finite(x.value)), lo = Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 83), ...vals.map(x => x.value)), hi = Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 84), ...vals.map(x => x.value)), span = hi - lo || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 85);
    const W = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 86), H = entries.length * __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 87) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 88), L = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 89), R = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 90), x = v => L + (W - L - R) * (v - lo) / span;
    let svg = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 91) + __MARKET_STRUCTURE_RUNTIME__.template(W) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 92) + __MARKET_STRUCTURE_RUNTIME__.template(H) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 93) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 94) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.title + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 95) + period + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 96) + c.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 97) + __MARKET_STRUCTURE_RUNTIME__.template(x(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 98))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 99) + __MARKET_STRUCTURE_RUNTIME__.template(x(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 100))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 101) + __MARKET_STRUCTURE_RUNTIME__.template(H - __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 102)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 103);
    entries.forEach((e, i) => {
      const y = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 104) + i * __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 105);
      svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 106) + __MARKET_STRUCTURE_RUNTIME__.template(L - __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 107)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 108) + __MARKET_STRUCTURE_RUNTIME__.template(y + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 109)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 110) + __MARKET_STRUCTURE_RUNTIME__.template(esc(e.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 111);
      if (finite(e.value)) {
        const a = x(Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 112), e.value)), b = x(Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 113), e.value));
        svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 114) + __MARKET_STRUCTURE_RUNTIME__.template(a) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 115) + __MARKET_STRUCTURE_RUNTIME__.template(y) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 116) + __MARKET_STRUCTURE_RUNTIME__.template(Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 117), b - a)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 118) + __MARKET_STRUCTURE_RUNTIME__.template(e.value >= __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 119) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 120) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 121)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 122) + __MARKET_STRUCTURE_RUNTIME__.template(esc(e.label + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 123) + e.value.toFixed(c.decimals || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 124)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 125) + c.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 126) + __MARKET_STRUCTURE_RUNTIME__.template(W - R + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 127)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 128) + __MARKET_STRUCTURE_RUNTIME__.template(y + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 129)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 130) + __MARKET_STRUCTURE_RUNTIME__.template(e.value >= __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 131) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 132) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 133)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 134) + __MARKET_STRUCTURE_RUNTIME__.template(e.value.toFixed(c.decimals || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 135))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 136);
      } else svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 137) + __MARKET_STRUCTURE_RUNTIME__.template(W - R + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 138)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 139) + __MARKET_STRUCTURE_RUNTIME__.template(y + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 140)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 141);
    });
    svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 142);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 143) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 144) + __MARKET_STRUCTURE_RUNTIME__.template(esc(period + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 145) + c.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 146) + __MARKET_STRUCTURE_RUNTIME__.template(svg) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 147) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.note)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 148) + __MARKET_STRUCTURE_RUNTIME__.template(cites(c.sources || [])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 149) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.calculation)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 150) + __MARKET_STRUCTURE_RUNTIME__.template(c.type === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 151) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 152) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 153)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 154);
  }
  function chart(t, c, index, cites) {
    if (c.type === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 155) || c.type === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 156)) return barChart(t, c, cites);
    let lines = c.keys.map((key, i) => ({
      key,
      name: c.labels?.[i] || meta(t, key).title,
      color: colors[i],
      points: chartRows(t, c, key)
    }));
    const dates = [...new Set(lines.flatMap(l => l.points.map(p => p.date)))].sort().slice(-(c.periods || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 157)));
    lines = lines.map(l => ({
      ...l,
      points: l.points.filter(p => dates.includes(p.date))
    }));
    const points = lines.flatMap(l => l.points), unit = c.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 158) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 159) : meta(t, c.keys[__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 160)]).unit;
    let svg = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 161);
    if (points.length) {
      const W = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 162), H = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 163), L = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 164), R = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 165), T = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 166), B = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 167), serial = s => +s.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 168), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 169)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 170) + +s.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 171), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 172)), xmin = serial(dates[__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 173)]), xmax = serial(dates.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 174)));
      let lo = Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 175), ...points.map(p => p.value)), hi = Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 176), ...points.map(p => p.value));
      const rough = (hi - lo || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 177)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 178), power = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 179) ** Math.floor(Math.log10(rough)), tick = [__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 180), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 181), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 182), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 183)].find(v => v * power >= rough) * power;
      lo = Math.floor(lo / tick) * tick;
      hi = Math.ceil(hi / tick) * tick;
      if (hi === lo) hi = lo + tick;
      const x = d => L + (W - L - R) * (xmax === xmin ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 184) : (serial(d) - xmin) / (xmax - xmin)), y = v => H - B - (H - T - B) * (v - lo) / (hi - lo);
      svg = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 185) + __MARKET_STRUCTURE_RUNTIME__.template(W) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 186) + __MARKET_STRUCTURE_RUNTIME__.template(H) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 187) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 188) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 189);
      for (let v = lo; v <= hi + tick * __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 190); v += tick) {
        svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 191) + __MARKET_STRUCTURE_RUNTIME__.template(L) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 192) + __MARKET_STRUCTURE_RUNTIME__.template(W - R) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 193) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 194) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 195) + __MARKET_STRUCTURE_RUNTIME__.template(L - __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 196)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 197) + __MARKET_STRUCTURE_RUNTIME__.template(y(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 198)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 199) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 200) ? v.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 201)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 202) : tick >= __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 203) ? v.toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 204), {
          maximumFractionDigits: __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 205)
        }) : v.toFixed(tick < __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 206) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 207) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 208)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 209);
      }
      if (lo < __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 210)) svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 211) + __MARKET_STRUCTURE_RUNTIME__.template(L) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 212) + __MARKET_STRUCTURE_RUNTIME__.template(W - R) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 213) + __MARKET_STRUCTURE_RUNTIME__.template(y(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 214))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 215) + __MARKET_STRUCTURE_RUNTIME__.template(y(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 216))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 217);
      dates.filter((d, i) => i === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 218) || i === dates.length - __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 219) || i % Math.ceil(dates.length / __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 220)) === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 221)).forEach(d => {
        svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 222) + __MARKET_STRUCTURE_RUNTIME__.template(x(d)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 223) + __MARKET_STRUCTURE_RUNTIME__.template(H - __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 224)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 225) + __MARKET_STRUCTURE_RUNTIME__.template(esc(pd(d, c.frequency).replace(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 226), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 227)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 228);
      });
      for (const l of lines) {
        let prev = null, path = __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 229);
        const step = c.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 230) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 231) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 232);
        for (const p of l.points) {
          path += (prev && serial(p.date) - serial(prev.date) === step ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 233) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 234)) + x(p.date).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 235)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 236) + y(p.value).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 237)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 238);
          prev = p;
        }
        svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 239) + __MARKET_STRUCTURE_RUNTIME__.template(path) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 240) + __MARKET_STRUCTURE_RUNTIME__.template(l.color) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 241);
        for (const p of l.points) svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 242) + __MARKET_STRUCTURE_RUNTIME__.template(x(p.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 243) + __MARKET_STRUCTURE_RUNTIME__.template(y(p.value)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 244) + __MARKET_STRUCTURE_RUNTIME__.template(l.color) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 245) + __MARKET_STRUCTURE_RUNTIME__.template(esc(l.name + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 246) + pd(p.date, c.frequency) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 247) + valueText(p.value, unit))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 248) + __MARKET_STRUCTURE_RUNTIME__.template(esc(l.name + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 249) + pd(p.date, c.frequency) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 250) + valueText(p.value, unit))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 251);
      }
      svg += __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 252);
    }
    const legend = lines.map(l => __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 253) + __MARKET_STRUCTURE_RUNTIME__.template(l.color) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 254) + __MARKET_STRUCTURE_RUNTIME__.template(esc(l.name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 255)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 256));
    const table = dates.map(date => __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 257) + __MARKET_STRUCTURE_RUNTIME__.template(esc(pd(date, c.frequency))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 258) + __MARKET_STRUCTURE_RUNTIME__.template(lines.map(l => {
      const p = l.points.find(p => p.date === date);
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 259) + __MARKET_STRUCTURE_RUNTIME__.template(esc(p?.source?.source_document || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 260))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 261) + __MARKET_STRUCTURE_RUNTIME__.template(p ? esc(valueText(p.value, unit)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 262)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 263);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 264))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 265)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 266));
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 267) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 268) + __MARKET_STRUCTURE_RUNTIME__.template(legend) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 269) + __MARKET_STRUCTURE_RUNTIME__.template(svg) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 270) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.note)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 271) + __MARKET_STRUCTURE_RUNTIME__.template(lines.map(l => __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 272) + __MARKET_STRUCTURE_RUNTIME__.template(esc(l.name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 273)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 274))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 275) + __MARKET_STRUCTURE_RUNTIME__.template(table) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 276) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.mode === __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 277) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 278) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 279))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 280) + __MARKET_STRUCTURE_RUNTIME__.template(esc(unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 281) + __MARKET_STRUCTURE_RUNTIME__.template(lines.map(l => esc(l.points.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 282))?.source.source_document || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 283))).filter((x, i, a) => a.indexOf(x) === i).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 284))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 285) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.keys[__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 286)])) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 287);
  }
  function stale(t, d) {
    return (d.anchors || []).some(a => {
      const p = a.latest === false ? Analytics.at(rows(t, a.key), a.date) : last(t, a.key);
      return !p || p.date !== a.date || Math.abs(p.value - a.value) > Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 288), Math.abs(a.value) * __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 289));
    });
  }
  function render(t, sourceCites) {
    const cites = ids => sourceCites(ids).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 290), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 291)), __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 292));
    const d = data.companies[t];
    if (!d) return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 293);
    const fresh = stale(t, d), cards = d.cards.map(c => {
      const a = cardState(t, c), date = a.period || pd(a.date, a.frequency);
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 294) + __MARKET_STRUCTURE_RUNTIME__.template(c.key ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 295) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.key)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 296) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 297)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 298) + __MARKET_STRUCTURE_RUNTIME__.template(esc(a.source ? [a.source.source_document, a.source.source_location].filter(Boolean).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 299)) : c.fixed?.source || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 300))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 301) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.label + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 302) + valueText(a.value, a.unit) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 303) + date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 304) + __MARKET_STRUCTURE_RUNTIME__.template(esc(c.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 305) + __MARKET_STRUCTURE_RUNTIME__.template(esc(valueText(a.value, a.unit))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 306) + __MARKET_STRUCTURE_RUNTIME__.template(esc(date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 307) + __MARKET_STRUCTURE_RUNTIME__.template(a.delta ? esc((a.delta.value >= __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 308) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 309) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 310)) + a.delta.value.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 311)) + (a.delta.pp ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 312) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 313)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 314)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 315)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 316) + __MARKET_STRUCTURE_RUNTIME__.template(esc(a.sub)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 317);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 318));
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 319) + __MARKET_STRUCTURE_RUNTIME__.template(esc(t)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 320) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.reviewed_at || data.reviewed_at)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 321) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.headline)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 322) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.summary)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 323) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.status)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 324) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.basis)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 325) + __MARKET_STRUCTURE_RUNTIME__.template(fresh ? __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 326) : __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 327)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 328) + __MARKET_STRUCTURE_RUNTIME__.template(cards) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 329) + __MARKET_STRUCTURE_RUNTIME__.template(d.takeaways.map((x, i) => __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 330) + __MARKET_STRUCTURE_RUNTIME__.template(i + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 331)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 332) + __MARKET_STRUCTURE_RUNTIME__.template(esc(x.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 333) + __MARKET_STRUCTURE_RUNTIME__.template(esc(x.fact)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 334) + __MARKET_STRUCTURE_RUNTIME__.template(esc(x.read)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 335) + __MARKET_STRUCTURE_RUNTIME__.template(cites(x.sources)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 336)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 337))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 338) + __MARKET_STRUCTURE_RUNTIME__.template(d.charts.map((c, i) => chart(t, c, i, cites)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 339))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 340) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.counter)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 341) + __MARKET_STRUCTURE_RUNTIME__.template(d.tests.map(x => __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 342) + __MARKET_STRUCTURE_RUNTIME__.template(esc(x.event)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 343) + __MARKET_STRUCTURE_RUNTIME__.template(esc(x.test)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 344)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 345))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 346) + __MARKET_STRUCTURE_RUNTIME__.template(esc(d.limit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 347);
  }
  function bind(root) {
    root.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 348)).forEach(b => b.addEventListener(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 349), () => {
      const key = b.dataset.pmMetric, d = meta(state.company, key);
      const tab = Object.keys(TAB_FAMILIES).find(t => TAB_FAMILIES[t] === d.family) || __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 350);
      setTab(tab, true);
      chooseMetric(key);
    }));
    root.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 351)).forEach(b => b.addEventListener(__MARKET_STRUCTURE_RUNTIME__.literal("module-005", 352), () => {
      const e = document.getElementById(b.dataset.pmEvidence);
      if (e) {
        e.open = true;
        e.scrollIntoView({
          block: __MARKET_STRUCTURE_RUNTIME__.literal("module-005", 353)
        });
      }
    }));
  }
  window.PMReview = {
    render,
    bind,
    data,
    cardState,
    chartRows,
    stale
  };
})();
