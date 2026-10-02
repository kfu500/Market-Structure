// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  "use strict";
  const D = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 0)).textContent), $c = id => document.getElementById(id), E = x => String(x ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 1)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 2), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 3)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 4)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 5),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 6)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 7),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 8)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 9),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 10)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 11),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 12)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 13)
  })[c]), P = DB.profiles;
  const colors = [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 14), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 15), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 16), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 17)];
  let view = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 18), lens = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 19), serial = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 20);
  const exports = new Map();
  const originalConf = {
    CME: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 21), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 22), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 23), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 24)],
    CBOE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 25), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 26), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 27), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 28)],
    ICE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 29), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 30), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 31), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 32)],
    NDAQ: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 33), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 34), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 35), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 36)],
    TW: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 37), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 38), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 39), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 40)],
    HOOD: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 41), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 42), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 43), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 44)]
  };
  const conf = {
    CME: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 45), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 46), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 47), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 48)],
    CBOE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 49), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 50), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 51), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 52)],
    ICE: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 53), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 54), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 55), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 56)],
    NDAQ: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 57), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 58), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 59), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 60)],
    TW: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 61), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 62), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 63), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 64)],
    HOOD: [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 65), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 66), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 67), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 68), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 69), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 70)]
  };
  const coverMetrics = {
    activity: {
      CME: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 71),
      CBOE: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 72),
      ICE: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 73),
      NDAQ: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 74),
      TW: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 75),
      HOOD: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 76)
    },
    economics: {
      CME: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 77),
      CBOE: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 78),
      ICE: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 79),
      NDAQ: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 80),
      TW: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 81),
      HOOD: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 82)
    }
  };
  const editorial = JSON.parse($c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 83)).textContent);
  const pctKeys = new Set([__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 84), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 85), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 86), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 87), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 88), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 89), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 90), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 91)]);
  const fmt = (n, k = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 92)) => Number(n).toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 93), {
    maximumFractionDigits: k
  });
  const label = d => new Date(d + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 94)).toLocaleDateString(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 95), {
    month: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 96),
    year: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 97),
    timeZone: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 98)
  });
  const partial = r => new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 99), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 100)).test(r.period_status || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 101));
  const actual = r => Number.isFinite(r.value) && !r.analysis_block && !partial(r) && r.date < (DB.refresh.checked_at || D.as_of).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 102), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 103)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 104) && !new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 105), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 106)).test([r.classification, r.period_status].join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 107)));
  function save(name, text, type) {
    const u = URL.createObjectURL(new Blob([text], {
      type
    })), a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 108));
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 109));
  }
  function table(labels, sets) {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 110) + __MARKET_STRUCTURE_RUNTIME__.template(sets.map(s => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 111) + __MARKET_STRUCTURE_RUNTIME__.template(E(s.name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 112)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 113))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 114) + __MARKET_STRUCTURE_RUNTIME__.template(labels.map((l, i) => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 115) + __MARKET_STRUCTURE_RUNTIME__.template(E(l)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 116) + __MARKET_STRUCTURE_RUNTIME__.template(sets.map(s => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 117) + __MARKET_STRUCTURE_RUNTIME__.template(s.values[i] == null ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 118) : fmt(s.values[i], __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 119))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 120)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 121))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 122)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 123))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 124);
  }
  function graph(labels, sets, {kind = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 125), unit = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 126), title = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 127), stack = false} = {}) {
    const w = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 128), h = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 129), L = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 130), R = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 131), T = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 132), B = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 133), pw = w - L - R, ph = h - T - B, n = labels.length;
    let vals = sets.flatMap(s => s.values.filter(v => v != null && Number.isFinite(v)));
    if (!vals.length) return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 134);
    const totals = stack ? labels.map((_, i) => sets.reduce((s, a) => s + (a.values[i] ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 135)), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 136))) : vals;
    let high = Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 137), ...totals), low = Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 138), ...totals);
    if (high === low) high = low + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 139);
    const raw = (high - low) * __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 140) / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 141), pow = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 142) ** Math.floor(Math.log10(raw)), tick = ([__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 143), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 144), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 145), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 146), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 147)].find(v => v * pow >= raw) || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 148)) * pow;
    high = Math.ceil(high * __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 149) / tick) * tick;
    low = Math.floor(low * __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 150) / tick) * tick;
    const span = high - low, X = i => L + (i + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 151)) * pw / n, Y = v => T + (high - v) / span * ph;
    let out = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 152) + __MARKET_STRUCTURE_RUNTIME__.template(w) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 153) + __MARKET_STRUCTURE_RUNTIME__.template(h) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 154) + __MARKET_STRUCTURE_RUNTIME__.template(E(title + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 155) + unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 156) + __MARKET_STRUCTURE_RUNTIME__.template(E(title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 157);
    for (let i = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 158); i <= Math.round(span / tick); i++) {
      const v = low + tick * i, y = Y(v);
      out += __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 159) + __MARKET_STRUCTURE_RUNTIME__.template(L) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 160) + __MARKET_STRUCTURE_RUNTIME__.template(w - R) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 161) + __MARKET_STRUCTURE_RUNTIME__.template(y) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 162) + __MARKET_STRUCTURE_RUNTIME__.template(y) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 163) + __MARKET_STRUCTURE_RUNTIME__.template(Math.abs(v) < __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 164) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 165) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 166)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 167) + __MARKET_STRUCTURE_RUNTIME__.template(L - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 168)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 169) + __MARKET_STRUCTURE_RUNTIME__.template(y + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 170)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 171) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(v, Math.abs(v) >= __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 172) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 173) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 174))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 175);
    }
    if (kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 176)) {
      const slot = pw / n, bw = Math.min(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 177), slot * __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 178) / (stack ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 179) : sets.length));
      labels.forEach((l, i) => {
        let acc = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 180);
        sets.forEach((a, j) => {
          let v = a.values[i];
          if (v == null) return;
          const x = stack ? X(i) - bw / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 181) : X(i) - bw * sets.length / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 182) + j * bw, y = Math.min(Y(v + (stack ? acc : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 183))), Y(stack ? acc : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 184)));
          out += __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 185) + __MARKET_STRUCTURE_RUNTIME__.template(x) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 186) + __MARKET_STRUCTURE_RUNTIME__.template(y) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 187) + __MARKET_STRUCTURE_RUNTIME__.template(Math.max(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 188), bw - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 189))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 190) + __MARKET_STRUCTURE_RUNTIME__.template(ph * Math.abs(v) / span) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 191) + __MARKET_STRUCTURE_RUNTIME__.template(a.color || colors[j]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 192) + __MARKET_STRUCTURE_RUNTIME__.template(E(l + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 193) + a.name + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 194) + fmt(v, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 195)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 196) + unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 197);
          if (n <= __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 198) && sets.length === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 199)) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 200) + __MARKET_STRUCTURE_RUNTIME__.template(X(i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 201) + __MARKET_STRUCTURE_RUNTIME__.template(y - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 202)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 203) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(v, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 204))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 205);
          acc += v;
        });
      });
    } else sets.forEach((a, j) => {
      let path = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 206), prev = false;
      a.values.forEach((v, i) => {
        if (v == null) {
          prev = false;
          return;
        }
        path += (prev ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 207) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 208)) + X(i) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 209) + Y(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 210);
        prev = true;
      });
      out += __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 211) + __MARKET_STRUCTURE_RUNTIME__.template(path) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 212) + __MARKET_STRUCTURE_RUNTIME__.template(a.color || colors[j]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 213);
      a.values.forEach((v, i) => {
        if (v != null) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 214) + __MARKET_STRUCTURE_RUNTIME__.template(X(i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 215) + __MARKET_STRUCTURE_RUNTIME__.template(Y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 216) + __MARKET_STRUCTURE_RUNTIME__.template(n > __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 217) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 218) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 219)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 220) + __MARKET_STRUCTURE_RUNTIME__.template(a.color || colors[j]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 221) + __MARKET_STRUCTURE_RUNTIME__.template(E(labels[i] + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 222) + a.name + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 223) + fmt(v, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 224)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 225) + unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 226);
      });
    });
    const step = n <= __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 227) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 228) : Math.ceil(n / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 229));
    labels.forEach((l, i) => {
      if (i % step === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 230) && (n - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 231) - i >= step * __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 232) || i === n - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 233)) || i === n - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 234)) out += __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 235) + __MARKET_STRUCTURE_RUNTIME__.template(X(i)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 236) + __MARKET_STRUCTURE_RUNTIME__.template(h - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 237)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 238) + __MARKET_STRUCTURE_RUNTIME__.template(E(l)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 239);
    });
    return out + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 240) + (__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 241) + __MARKET_STRUCTURE_RUNTIME__.template(sets.map((a, i) => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 242) + __MARKET_STRUCTURE_RUNTIME__.template(a.color || colors[i]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 243) + __MARKET_STRUCTURE_RUNTIME__.template(E(a.name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 244)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 245))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 246) + __MARKET_STRUCTURE_RUNTIME__.template(E(unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 247));
  }
  function card({title, kicker = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 248), headline = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 249), detail = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 250), labels, sets, kind = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 251), stack = false, unit = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 252), source = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 253), provenance = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 254), href = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 255), go = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 256), rows = null}) {
    const id = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 257) + ++serial;
    exports.set(id, rows || labels.map((l, i) => Object.fromEntries([[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 258), l], ...sets.map(s => [s.name, s.values[i] ?? null]), [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 259), unit], [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 260), source]])));
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 261) + __MARKET_STRUCTURE_RUNTIME__.template(E(kicker)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 262) + __MARKET_STRUCTURE_RUNTIME__.template(go ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 263) + __MARKET_STRUCTURE_RUNTIME__.template(E(go)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 264) + __MARKET_STRUCTURE_RUNTIME__.template(E(go)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 265) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 266)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 267) + __MARKET_STRUCTURE_RUNTIME__.template(E(title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 268) + __MARKET_STRUCTURE_RUNTIME__.template(headline ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 269) + __MARKET_STRUCTURE_RUNTIME__.template(E(headline)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 270) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 271)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 272) + __MARKET_STRUCTURE_RUNTIME__.template(E(detail)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 273) + __MARKET_STRUCTURE_RUNTIME__.template(graph(labels, sets, {
      kind,
      stack,
      unit,
      title
    })) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 274) + __MARKET_STRUCTURE_RUNTIME__.template(href ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 275) + __MARKET_STRUCTURE_RUNTIME__.template(E(href)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 276) + __MARKET_STRUCTURE_RUNTIME__.template(E(source)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 277) : E(source)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 278) + __MARKET_STRUCTURE_RUNTIME__.template(E(provenance)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 279) + __MARKET_STRUCTURE_RUNTIME__.template(id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 280) + __MARKET_STRUCTURE_RUNTIME__.template(table(labels, sets)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 281);
  }
  function history(t, k, cover = false) {
    const p = P[t], m = p.metric_meta[k];
    if (!m) return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 282);
    const all = p.series[k] || [], a = all.filter(actual).sort((a, b) => a.date.localeCompare(b.date)), last = a.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 283));
    if (!last) return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 284);
    const factor = pctKeys.has(k) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 285) : m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 286) || m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 287) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 288) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 289), unit = factor === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 290) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 291) + m.unit : m.unit, isQuarter = m.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 292);
    const year = last.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 293), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 294)), prior = String(+year - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 295)), month = +last.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 296), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 297)), season = view === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 298) && !isQuarter && !new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 299), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 300)).test(k), byDate = new Map(a.map(r => [r.date, r]));
    const comparisons = JSON.parse($c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 301)).textContent);
    const yoy = r => comparisons[t]?.[k]?.[r.date]?.yoy ?? null;
    let labels, sets, chartUnit = unit, pointDates;
    if (season) {
      pointDates = [prior, year].map(y => Array.from({
        length: month
      }, (_, i) => y + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 302) + String(i + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 303)).padStart(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 304), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 305)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 306)));
      labels = Array.from({
        length: month
      }, (_, i) => new Date(Date.UTC(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 307), i, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 308))).toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 309), {
        month: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 310),
        timeZone: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 311)
      }));
      sets = [prior, year].map((y, i) => ({
        name: y,
        color: i === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 312) ? colors[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 313)] : colors[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 314)],
        values: labels.map((_, i) => {
          const r = byDate.get(y + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 315) + String(i + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 316)).padStart(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 317), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 318)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 319));
          return r ? r.value * factor : null;
        })
      }));
    } else {
      const first = a.slice(-__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 320))[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 321)].date, step = isQuarter ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 322) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 323), q = [];
      let d = first;
      while (d <= last.date) {
        q.push({
          date: d,
          ...byDate.get(d) || ({})
        });
        const n = new Date(d + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 324));
        n.setUTCMonth(n.getUTCMonth() + step);
        d = n.toISOString().slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 325), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 326));
      }
      pointDates = [q.map(r => r.date)];
      labels = q.map(r => isQuarter ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 327) + Math.ceil(+r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 328), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 329)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 330)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 331) + r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 332), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 333)) : label(r.date));
      sets = [{
        name: view === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 334) ? pctKeys.has(k) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 335) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 336) : new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 337), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 338)).test(k) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 339) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 340),
        values: q.map(r => r.value == null ? null : view === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 341) ? yoy(r) : r.value * factor)
      }];
      if (view === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 342)) chartUnit = pctKeys.has(k) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 343) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 344);
    }
    const mt = all.filter(r => partial(r) && !r.analysis_block).sort((a, b) => (a.as_of || a.date).localeCompare(b.as_of || b.date)).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 345));
    let note = mt ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 346) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(mt.value * factor, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 347))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 348) + __MARKET_STRUCTURE_RUNTIME__.template(unit) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 349) + __MARKET_STRUCTURE_RUNTIME__.template(mt.as_of || mt.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 350) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 351);
    if (t === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 352) && [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 353), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 354)].includes(k)) {
      const tb = DB.refresh.companies.ICE.tables.find(z => z.rows?.some(r => r.mtd_adv != null && r.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 355))), r = tb?.rows.find(r => r.metric === (k === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 356) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 357) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 358)));
      if (r) note = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 359) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(r.mtd_adv, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 360))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 361) + __MARKET_STRUCTURE_RUNTIME__.template(tb.as_of) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 362);
    }
    if (new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 363), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 364)).test(k) && m.window_months === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 365)) note = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 366);
    if (m.scope_note) note += (note ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 367) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 368)) + m.scope_note;
    if (k === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 369)) note = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 370);
    const src = last.source_provider || last.source_document || p.source || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 371), g = yoy(last), headline = fmt(last.value * factor, new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 372), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 373)).test(k) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 374) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 375)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 376) + unit;
    const change = g == null ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 377) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 378) + __MARKET_STRUCTURE_RUNTIME__.template(g > __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 379) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 380) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 381)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 382) + __MARKET_STRUCTURE_RUNTIME__.template(fmt(g, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 383))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 384) + __MARKET_STRUCTURE_RUNTIME__.template(pctKeys.has(k) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 385) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 386)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 387);
    return card({
      title: t + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 388) + m.title,
      kicker: (season ? year + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 389) + prior : view === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 390) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 391) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 392)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 393) + (isQuarter ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 394) + Math.ceil(month / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 395)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 396) + year : label(last.date)),
      headline,
      detail: (note || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 397)) + change,
      labels,
      sets,
      kind: season ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 398) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 399),
      unit: chartUnit,
      source: String(src).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 400), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 401)),
      href: last.source_url || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 402),
      provenance: [m.description, last.period_status, last.validation, last.source_location, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 403)].filter(Boolean).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 404)),
      go: cover ? t : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 405),
      rows: sets.flatMap((set, j) => labels.map((period, i) => {
        const date = pointDates[j][i], r = byDate.get(date), old = byDate.get(+date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 406), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 407)) - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 408) + date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 409)));
        return {
          period,
          date,
          series: set.name,
          display_value: set.values[i] ?? null,
          display_unit: chartUnit,
          raw_value: r?.value ?? null,
          raw_unit: m.unit,
          source_document: r?.source_document || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 410),
          source_location: r?.source_location || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 411),
          source_url: r?.source_url || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 412),
          period_status: r?.period_status || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 413),
          calculation: view === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 414) ? pctKeys.has(k) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 415) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 416) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 417) + factor,
          prior_year_date: view === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 418) ? old?.date || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 419) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 420),
          prior_year_value: view === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 421) ? old?.value ?? null : null,
          prior_year_source: view === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 422) ? old?.source_document || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 423) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 424),
          scope: m.scope_note || m.description || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 425)
        };
      }))
    });
  }
  function benchmark(t) {
    let rows = D.rj.rows.filter(r => !t || r.ticker === t);
    if (!rows.length) return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 426);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 427) + __MARKET_STRUCTURE_RUNTIME__.template(D.rj.cutoff) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 428) + __MARKET_STRUCTURE_RUNTIME__.template(D.rj.source) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 429) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.rj.period)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 430) + __MARKET_STRUCTURE_RUNTIME__.template(rows.map(r => {
      const g = r.reported_gap_pct;
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 431) + __MARKET_STRUCTURE_RUNTIME__.template(r.ticker) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 432) + __MARKET_STRUCTURE_RUNTIME__.template(E(r.metric)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 433) + __MARKET_STRUCTURE_RUNTIME__.template(g >= __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 434) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 435) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 436)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 437) + __MARKET_STRUCTURE_RUNTIME__.template(g > __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 438) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 439) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 440)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 441) + __MARKET_STRUCTURE_RUNTIME__.template(g.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 442))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 443) + __MARKET_STRUCTURE_RUNTIME__.template(g < __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 444) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 445) + g * __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 446) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 447)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 448) + __MARKET_STRUCTURE_RUNTIME__.template(Math.abs(g) * __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 449)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 450) + __MARKET_STRUCTURE_RUNTIME__.template(g < __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 451) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 452) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 453)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 454) + __MARKET_STRUCTURE_RUNTIME__.template(r.actual.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 455))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 456) + __MARKET_STRUCTURE_RUNTIME__.template(r.street.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 457))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 458) + __MARKET_STRUCTURE_RUNTIME__.template(E(r.unit)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 459);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 460))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 461) + __MARKET_STRUCTURE_RUNTIME__.template(E(D.rj.caveats)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 462) + __MARKET_STRUCTURE_RUNTIME__.template(rows.map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 463) + __MARKET_STRUCTURE_RUNTIME__.template(r.ticker) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 464) + __MARKET_STRUCTURE_RUNTIME__.template(E(r.metric)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 465) + __MARKET_STRUCTURE_RUNTIME__.template(r.actual) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 466) + __MARKET_STRUCTURE_RUNTIME__.template(r.street) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 467) + __MARKET_STRUCTURE_RUNTIME__.template(r.reported_gap_pct) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 468)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 469))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 470);
  }
  function weekly() {
    const p = D.piper;
    return card({
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 471),
      kicker: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 472),
      headline: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 473),
      detail: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 474),
      labels: p.weeks.map(x => x.start.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 475)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 476) + x.end.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 477))),
      sets: [{
        name: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 478),
        values: p.weeks.map(x => x.total_bn)
      }],
      kind: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 479),
      unit: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 480),
      source: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 481),
      href: D.sources[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 482)].url,
      provenance: p.scope + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 483)
    });
  }
  function monthly() {
    const p = D.piper;
    return card({
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 484),
      kicker: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 485),
      headline: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 486),
      detail: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 487),
      labels: p.months.map(x => label(x.date)),
      sets: [{
        name: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 488),
        values: p.months.map(x => x.kalshi_bn)
      }, {
        name: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 489),
        values: p.months.map(x => x.polymarket_bn)
      }],
      kind: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 490),
      stack: true,
      unit: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 491),
      source: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 492),
      href: D.sources[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 493)].url,
      provenance: p.scope + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 494) + p.mtd.rounding_note
    });
  }
  function combos() {
    const p = D.piper;
    return card({
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 495),
      kicker: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 496),
      headline: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 497),
      detail: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 498),
      labels: p.combo_days.map(x => x.label),
      sets: [{
        name: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 499),
        values: p.combo_days.map(x => x.combo_pct)
      }],
      kind: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 500),
      unit: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 501),
      source: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 502),
      href: D.sources[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 503)].url,
      provenance: p.combo_basis + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 504)
    });
  }
  function comboActivity() {
    const p = D.piper;
    return card({
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 505),
      kicker: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 506),
      headline: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 507),
      detail: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 508),
      labels: p.combo_days.map(x => x.label),
      sets: [{
        name: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 509),
        values: p.combo_days.map(x => x.combo_adv_m)
      }],
      kind: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 510),
      unit: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 511),
      source: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 512),
      href: D.sources[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 513)].url,
      provenance: p.combo_basis
    });
  }
  function rothera(oi = false) {
    const d = JSON.parse($c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 514)).textContent), a = d.daily, field = oi ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 515) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 516), last = a.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 517));
    return card({
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 518) + (oi ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 519) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 520)),
      kicker: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 521) + last.date,
      headline: fmt(last[field] / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 522)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 523),
      detail: oi ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 524) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 525),
      labels: a.map(x => x.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 526))),
      sets: [{
        name: oi ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 527) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 528),
        values: a.map(x => x[field] / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 529))
      }],
      unit: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 530),
      source: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 531),
      provenance: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 532),
      rows: a
    });
  }
  function routing() {
    const p = D.piper;
    return card({
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 533),
      kicker: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 534),
      headline: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 535),
      detail: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 536),
      labels: p.hood_estimates.map(x => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 537) + x.cutoff.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 538))),
      sets: [{
        name: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 539),
        values: p.hood_estimates.map(x => x.routing_share_pct)
      }],
      kind: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 540),
      unit: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 541),
      source: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 542),
      href: D.sources[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 543)].url,
      provenance: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 544)
    });
  }
  function predictionHTML() {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 545) + __MARKET_STRUCTURE_RUNTIME__.template(JSON.parse($c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 546)).textContent).daily.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 547)).date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 548) + __MARKET_STRUCTURE_RUNTIME__.template(weekly() + monthly() + combos() + comboActivity() + rothera() + rothera(true)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 549) + __MARKET_STRUCTURE_RUNTIME__.template(routing()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 550);
  }
  function sourceLinks(t, theme) {
    return (theme.sources || []).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 551), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 552)).map(x => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 553) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 554) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.provider || x.sender?.name || x.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 555) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 556)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 557));
  }
  function thesis(t) {
    const e = editorial.companies[t];
    if (!e) return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 558);
    const topics = e.themes || [];
    const render = x => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 559) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 560) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.takeaway)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 561) + __MARKET_STRUCTURE_RUNTIME__.template(sourceLinks(t, x) || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 562)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 563) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.limit || x.caveat || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 564))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 565);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 566) + __MARKET_STRUCTURE_RUNTIME__.template(E(editorial.as_of)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 567) + __MARKET_STRUCTURE_RUNTIME__.template(E(e.company_overview || e.overview || __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 568))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 569) + __MARKET_STRUCTURE_RUNTIME__.template(topics.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 570), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 571)).map(render).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 572))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 573) + __MARKET_STRUCTURE_RUNTIME__.template(topics.length > __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 574) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 575) + __MARKET_STRUCTURE_RUNTIME__.template(topics.length - __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 576)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 577) + __MARKET_STRUCTURE_RUNTIME__.template(topics.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 578)).map(render).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 579))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 580) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 581)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 582);
  }
  function latest(t) {
    const p = P[t], items = [];
    const add = (name, value, date, status) => items.push({
      name,
      value,
      date,
      status
    });
    if (t === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 583)) {
      const tb = DB.refresh.companies.HOOD.tables.find(x => x.rows?.some(r => r.mtd_total != null));
      for (const r of tb?.rows || []) add(r.metric, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 584) + fmt(r.adv, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 585)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 586) + r.adv_unit, tb.as_of, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 587) + __MARKET_STRUCTURE_RUNTIME__.template(r.days) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 588));
    } else if (t === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 589)) {
      for (const k of [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 590), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 591), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 592)]) {
        const r = p.series[k].filter(partial).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 593));
        if (r) add(p.metric_meta[k].title, fmt(r.value / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 594), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 595)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 596), r.as_of || r.date, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 597) + __MARKET_STRUCTURE_RUNTIME__.template(r.days) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 598));
      }
      const tb = DB.refresh.companies.CME.tables.find(x => x.rows?.some(r => r.open_interest != null)), r = tb?.rows.find(r => r.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 599));
      if (r) add(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 600), fmt(r.open_interest / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 601), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 602)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 603), tb.as_of, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 604));
    } else if (t === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 605)) {
      const tb = DB.refresh.companies.ICE.tables.find(x => x.rows?.some(r => r.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 606) && r.mtd_adv != null));
      for (const key of [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 607), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 608), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 609)]) {
        const r = tb?.rows.find(x => x.metric === key);
        if (r) add(key, fmt(r.mtd_adv, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 610)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 611), tb.as_of, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 612));
      }
      const r = tb?.rows.find(x => x.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 613));
      if (r) add(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 614), fmt(r.oi, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 615)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 616), tb.as_of, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 617));
    } else {
      for (const k of conf[t].slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 618), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 619))) {
        const r = p.series[k].filter(x => !x.analysis_block && Number.isFinite(x.value)).at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 620));
        if (!r) continue;
        const m = p.metric_meta[k], f = pctKeys.has(k) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 621) : m.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 622) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 623) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 624);
        add(m.title, fmt(r.value * f, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 625)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 626) + (f === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 627) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 628) : m.unit), r.as_of || (m.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 629) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 630) + Math.ceil(+r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 631), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 632)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 633)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 634) + r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 635), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 636)) : label(r.date)), partial(r) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 637) : m.window_months === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 638) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 639) : m.frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 640) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 641) + r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 642), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 643)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 644));
      }
    }
    if ([__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 645), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 646)].includes(t)) {
      const tb = DB.refresh.companies[t].tables.find(x => x.rows?.some(r => r.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 647))), r = tb?.rows.find(x => x.unit === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 648));
      if (r) add(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 649), fmt(r.value / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 650), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 651)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 652), tb.as_of, r.days + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 653));
      if (t === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 654)) {
        const ft = DB.refresh.companies[t].tables.find(x => x.title.startsWith(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 655))), f = ft?.rows.find(x => x.metric === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 656));
        if (f) add(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 657), fmt(f.volume, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 658)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 659), ft.as_of, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 660));
      }
    }
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 661) + __MARKET_STRUCTURE_RUNTIME__.template(items.map(x => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 662) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.name)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 663) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.value)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 664) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 665) + __MARKET_STRUCTURE_RUNTIME__.template(E(x.status)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 666)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 667))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 668) + __MARKET_STRUCTURE_RUNTIME__.template(t === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 669) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 670) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 671)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 672);
  }
  function iceOI(change = false) {
    const tb = DB.refresh.companies.ICE.tables.find(x => x.title.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 673)));
    if (!tb) return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 674);
    return card({
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 675) + (change ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 676) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 677)),
      kicker: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 678) + tb.rows[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 679)].date + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 680) + tb.as_of,
      headline: fmt((change ? tb.rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 681)).oi_change : tb.rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 682)).oi) / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 683), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 684)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 685),
      detail: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 686),
      labels: tb.rows.map(r => r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 687))),
      sets: [{
        name: change ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 688) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 689),
        values: tb.rows.map(r => change ? r.oi_change == null ? null : r.oi_change / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 690) : r.oi / __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 691))
      }],
      kind: change ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 692) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 693),
      unit: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 694),
      source: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 695),
      provenance: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 696),
      rows: tb.rows
    });
  }
  function researchCoverage() {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 697) + __MARKET_STRUCTURE_RUNTIME__.template(E(editorial.coverage_summary)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 698);
  }
  const cover = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 699));
  cover.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 700);
  cover.hidden = true;
  $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 701)).before(cover);
  const company = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 702));
  company.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 703);
  company.hidden = true;
  $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 704)).before(company);
  const context = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 705));
  context.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 706);
  context.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 707);
  context.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 708);
  $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 709)).before(context);
  context.appendChild($c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 710)));
  context.hidden = true;
  const nav = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 711));
  nav.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 712);
  nav.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 713);
  nav.dataset.section = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 714);
  nav.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 715);
  $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 716)).prepend(nav);
  function controls() {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 717) + __MARKET_STRUCTURE_RUNTIME__.template([[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 718), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 719)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 720), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 721)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 722), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 723)]].map(([k, v]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 724) + __MARKET_STRUCTURE_RUNTIME__.template(view === k ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 725) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 726)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 727) + __MARKET_STRUCTURE_RUNTIME__.template(k) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 728) + __MARKET_STRUCTURE_RUNTIME__.template(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 729)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 730))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 731);
  }
  function coverRender() {
    cover.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 732) + __MARKET_STRUCTURE_RUNTIME__.template([[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 733), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 734)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 735), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 736)]].map(([k, v]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 737) + __MARKET_STRUCTURE_RUNTIME__.template(lens === k ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 738) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 739)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 740) + __MARKET_STRUCTURE_RUNTIME__.template(k) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 741) + __MARKET_STRUCTURE_RUNTIME__.template(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 742)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 743))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 744) + controls() + (__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 745) + __MARKET_STRUCTURE_RUNTIME__.template(Object.keys(conf).map(t => history(t, coverMetrics[lens][t], true)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 746))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 747)) + benchmark() + (__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 748) + __MARKET_STRUCTURE_RUNTIME__.template(weekly() + combos()) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 749)) + researchCoverage();
    bind(cover);
    if (window.RJMarket) window.RJMarket.addCover(cover);
  }
  function companyRender(t) {
    company.innerHTML = thesis(t) + latest(t) + controls() + (__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 750) + __MARKET_STRUCTURE_RUNTIME__.template(conf[t].map(k => history(t, k)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 751))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 752) + __MARKET_STRUCTURE_RUNTIME__.template(t === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 753) ? iceOI() + iceOI(true) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 754)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 755)) + benchmark(t) + (t === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 756) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 757) + __MARKET_STRUCTURE_RUNTIME__.template([__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 758), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 759), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 760), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 761)].map(k => history(t, k)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 762))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 763) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 764)) + researchCoverage();
    bind(company);
  }
  function bind(p) {
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 765)).forEach(b => b.onclick = () => {
      lens = b.dataset.trendLens;
      coverRender();
    });
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 766)).forEach(b => b.onclick = () => setTab(b.dataset.trendTab));
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 767)).forEach(b => b.onclick = () => {
      const r = $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 768));
      r.hidden = false;
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 769)).hidden = false;
      r.open = true;
      r.scrollIntoView?.({
        behavior: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 770),
        block: __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 771)
      });
    });
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 772)).forEach(b => b.onclick = () => save(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 773) + editorial.as_of + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 774), JSON.stringify(editorial, null, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 775)), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 776)));
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 777)).forEach(b => b.onclick = () => {
      state.company = b.dataset.mcCompany;
      setupCompany();
      setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 778));
    });
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 779)).forEach(b => b.onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 780)));
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 781)).forEach(b => b.onclick = () => {
      view = b.dataset.mcView;
      state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 782) ? coverRender() : companyRender(state.company);
    });
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 783)).forEach(b => b.onclick = () => {
      const a = exports.get(b.dataset.mcExport);
      if (!a?.length) return;
      const keys = [...new Set(a.flatMap(x => Object.keys(x)))], cell = x => __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 784) + String(x ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 785)).replaceAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 786), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 787)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 788);
      save(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 789) + b.dataset.mcExport + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 790), [keys.map(cell).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 791)), ...a.map(r => keys.map(k => cell(typeof r[k] === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 792) ? JSON.stringify(r[k]) : r[k])).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 793)))].join(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 794)), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 795));
    });
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 796)).forEach(b => b.onclick = () => save(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 797), JSON.stringify(D, null, __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 798)), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 799)));
  }
  let onCover = false;
  const tabs = document.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 800)), snapshot = document.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 801)), prev = setTab;
  setTab = function (name, reset) {
    if (onCover && name !== __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 802)) {
      tabs.hidden = false;
      snapshot.hidden = false;
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 803)).textContent = P[state.company].name;
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 804)).textContent = state.company + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 805);
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 806)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 807);
    }
    onCover = name === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 808);
    prev(name, reset);
    cover.hidden = !onCover;
    company.hidden = name !== __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 809);
    context.hidden = name !== __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 810);
    if (onCover) {
      tabs.hidden = true;
      snapshot.hidden = true;
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 811)).hidden = true;
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 812)).open = false;
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 813)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 814);
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 815)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 816);
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 817)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 818);
      document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 819)).forEach(b => {
        const yes = b.id === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 820);
        b.classList.toggle(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 821), yes);
        b.setAttribute(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 822), yes ? __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 823) : __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 824));
      });
      coverRender();
    }
    if (name === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 825)) {
      context.open = false;
      companyRender(state.company);
    }
    if (name === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 826) && state.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 827)) {
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 828)).insertAdjacentHTML(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 829), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 830) + routing() + rothera() + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 831));
      bind($c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 832)));
    }
    if (name === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 833) && state.company === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 834) && !window.PredictionMarkets?.data?.broker_reports) $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 835)).insertAdjacentHTML(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 836), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 837) + D.sources[__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 838)].url + __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 839));
  };
  const setup = setupCompany;
  setupCompany = function () {
    onCover = false;
    tabs.hidden = false;
    snapshot.hidden = false;
    setup();
  };
  nav.onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 840));
  const primary = new Set([__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 841), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 842), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 843), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 844), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 845)]);
  const more = $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 846)), moreTabs = more.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 847));
  if (moreTabs) {
    document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 848)).forEach(b => {
      if (!primary.has(b.dataset.tab)) moreTabs.appendChild(b);
    });
    const lab = more.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 849));
    if (lab) lab.textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 850);
  }
  document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 851)).forEach(b => {
    if (b.dataset.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 852)) b.textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 853);
    if (b.dataset.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 854)) b.textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 855);
    if (b.dataset.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 856)) b.textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 857);
  });
  const cleanTab = setTab;
  setTab = function (name, reset) {
    cleanTab(name, reset);
    more.open = false;
    if (![__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 858), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 859)].includes(name)) {
      snapshot.hidden = true;
      tabs.hidden = false;
    }
    if ([__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 860), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 861), __MARKET_STRUCTURE_RUNTIME__.literal("module-019", 862)].includes(name)) {
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 863)).hidden = true;
      $c(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 864)).hidden = true;
    }
  };
  window.MarketChartCover = {
    data: D,
    history,
    graph,
    coverRender,
    companyRender,
    predictionHTML,
    bind,
    actual,
    exports,
    latest,
    thesis,
    conf,
    setView: v => {
      view = v;
    },
    setLens: v => {
      lens = v;
    }
  };
  setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-019", 865));
})();
