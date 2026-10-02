// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  "use strict";
  const get = id => document.getElementById(id), E = x => String(x ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 0)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 1), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 2)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 3)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 4),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 5)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 6),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 7)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 8),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 9)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 10),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 11)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 12)
  })[c]), num = x => typeof x === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 13) && Number.isFinite(x), json = id => JSON.parse(get(id).textContent);
  const columns = [__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 14), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 15), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 16), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 17), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 18), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 19), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 20), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 21), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 22), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 23), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 24), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 25), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 26), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 27), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 28), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 29), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 30), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 31)];
  function record(x) {
    return Object.fromEntries(columns.map(k => [k, x[k] ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 32)]));
  }
  function* observations() {
    if (window.MarketContext) yield* window.MarketContext.observations();
    for (const [company, p] of Object.entries(DB.profiles)) for (const [key, series] of Object.entries(p.series || ({}))) for (let i = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 33); i < series.length; i++) {
      const r = series[i], m = p.metric_meta[key] || ({});
      if (!num(r.value)) continue;
      yield record({
        observation_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 34) + __MARKET_STRUCTURE_RUNTIME__.template(company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 35) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 36) + __MARKET_STRUCTURE_RUNTIME__.template(i) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 37),
        company_or_venue: company,
        metric_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 38) + __MARKET_STRUCTURE_RUNTIME__.template(company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 39) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 40),
        metric: m.title || key,
        period: r.date,
        as_of: r.as_of || r.date,
        frequency: m.frequency,
        value: r.value,
        unit: r.unit || m.unit,
        measure_type: m.aggregation || m.family,
        status: r.period_status || r.classification,
        role: r.analysis_block ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 41) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 42),
        source_document: r.source_document || r.source_provider || p.source,
        source_location: r.source_location,
        source_url: r.source_url,
        retrieved_at: r.retrieved_at,
        scope: r.scope || m.description,
        source_record: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 43) + __MARKET_STRUCTURE_RUNTIME__.template(company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 44) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 45) + __MARKET_STRUCTURE_RUNTIME__.template(i) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 46)
      });
    }
    for (const [company, c] of Object.entries(DB.refresh.companies)) for (let ti = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 47); ti < (c.tables || []).length; ti++) {
      const t = c.tables[ti], source = (t.sources || c.sources || [])[__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 48)] || ({});
      for (let ri = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 49); ri < (t.rows || []).length; ri++) {
        const r = t.rows[ri];
        for (const col of t.columns || []) {
          const key = col.key;
          if (!col.numeric || key === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 50) || key === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 51) || !num(r[key])) continue;
          const stock = new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 52), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 53)).test(key), partial = new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 54), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 55)).test(key) || new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 56), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 57)).test(r.metric || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 58)) && !r.date, daily = !!r.date || new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 59), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 60)).test(key);
          let unit = r.unit || t.unit || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 61);
          if (key === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 62)) unit = r.raw_unit || unit;
          if (key === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 63)) unit = r.adv_unit || unit;
          if (new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 64), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 65)).test(key)) unit = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 66);
          if (company === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 67) && new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 68), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 69)).test(t.title || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 70)) && !new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 71), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 72)).test(t.title || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 73))) {
            const scaled = new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 74), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 75)).test(col.label || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 76));
            unit = (scaled ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 77) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 78)) + (stock || key === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 79) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 80) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 81)) + (new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 82), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 83)).test(key) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 84) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 85));
          }
          yield record({
            observation_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 86) + __MARKET_STRUCTURE_RUNTIME__.template(company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 87) + __MARKET_STRUCTURE_RUNTIME__.template(ti) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 88) + __MARKET_STRUCTURE_RUNTIME__.template(ri) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 89) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 90),
            company_or_venue: company,
            metric_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 91) + __MARKET_STRUCTURE_RUNTIME__.template(company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 92) + __MARKET_STRUCTURE_RUNTIME__.template(ti) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 93) + __MARKET_STRUCTURE_RUNTIME__.template(r.metric || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 94)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 95) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 96),
            metric: (r.metric || t.title) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 97) + (col.label || key),
            period: r.date || r.period_start || t.period_start || (partial ? (t.as_of || c.as_of || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 98)).slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 99), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 100)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 101) : t.as_of || c.as_of),
            as_of: r.as_of || r.date || t.as_of || c.as_of,
            frequency: stock ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 102) : new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 103), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 104)).test(key) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 105) : new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 106), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 107)).test(key) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 108) : partial ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 109) : daily ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 110) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 111),
            value: r[key],
            unit: unit || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 112),
            measure_type: stock ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 113) : key === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 114) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 115) : key.endsWith(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 116)) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 117) : new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 118), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 119)).test(key) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 120) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 121),
            status: t.period_status,
            role: new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 122), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 123)).test(t.title + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 124) + t.period_status) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 125) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 126),
            source_document: source.document || source.title,
            source_location: (source.location || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 127)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 128) + (r.source_row ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 129) + r.source_row : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 130) + ri) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 131) + key,
            source_url: source.url,
            retrieved_at: t.retrieved_at || c.checked_at,
            scope: t.scope || t.note,
            source_record: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 132) + __MARKET_STRUCTURE_RUNTIME__.template(company) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 133) + __MARKET_STRUCTURE_RUNTIME__.template(ti) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 134) + __MARKET_STRUCTURE_RUNTIME__.template(ri) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 135) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 136)
          });
        }
      }
    }
    const rd = json(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 137));
    for (let i = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 138); i < rd.daily.length; i++) {
      const r = rd.daily[i];
      for (const key of [__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 139), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 140), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 141)]) if (num(r[key])) yield record({
        observation_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 142) + __MARKET_STRUCTURE_RUNTIME__.template(r.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 143) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 144),
        company_or_venue: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 145),
        metric_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 146) + key,
        metric: key,
        period: r.date,
        as_of: r.date,
        frequency: key === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 147) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 148) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 149),
        value: r[key],
        unit: key === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 150) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 151) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 152),
        measure_type: key === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 153) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 154) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 155),
        status: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 156),
        role: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 157),
        source_document: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 158) + r.date.replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 159), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 160)), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 161)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 162),
        source_location: r.sha256,
        source_url: r.source_url,
        scope: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 163),
        source_record: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 164) + __MARKET_STRUCTURE_RUNTIME__.template(i) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 165) + __MARKET_STRUCTURE_RUNTIME__.template(key) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 166)
      });
    }
    const RJ = window.RJMarket.data;
    for (const [group, s] of Object.entries(RJ.data)) for (const frequency of [__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 167), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 168)]) for (const r of s[frequency]) for (let j = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 169); j < s.columns.length; j++) {
      const col = s.columns[j], meta = s.meta[col], v = r[j + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 170)];
      if (!num(v)) continue;
      const share = meta.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 171), stock = meta.kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 172);
      const name = meta.name, company = new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 173), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 174)).test(name) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 175) : new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 176), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 177)).test(name) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 178) : new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 179), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 180)).test(name) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 181) : new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 182), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 183)).test(name) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 184) : name;
      yield record({
        observation_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 185) + __MARKET_STRUCTURE_RUNTIME__.template(group) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 186) + __MARKET_STRUCTURE_RUNTIME__.template(frequency) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 187) + __MARKET_STRUCTURE_RUNTIME__.template(r[__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 188)]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 189) + __MARKET_STRUCTURE_RUNTIME__.template(col) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 190),
        company_or_venue: company,
        metric_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 191) + __MARKET_STRUCTURE_RUNTIME__.template(group) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 192) + __MARKET_STRUCTURE_RUNTIME__.template(col) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 193),
        metric: name,
        period: r[__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 194)],
        as_of: frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 195) ? r[__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 196)].slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 197), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 198)) : r[__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 199)],
        frequency,
        value: v,
        unit: share ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 200) : s.unit + (frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 201) && !stock ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 202) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 203)),
        measure_type: meta.kind,
        status: frequency === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 204) ? stock ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 205) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 206) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 207),
        role: group === __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 208) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 209) : __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 210),
        source_document: (RJ.row_provenance?.[group + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 211) + frequency + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 212) + r[__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 213)]] || RJ.source).file_name,
        source_location: s.sheet + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 214) + col + r[__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 215)],
        source_url: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 216),
        retrieved_at: (RJ.row_provenance?.[group + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 217) + frequency + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 218) + r[__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 219)]] || RJ.source).retrieved_at,
        scope: s.scope,
        source_record: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 220) + __MARKET_STRUCTURE_RUNTIME__.template(group) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 221) + __MARKET_STRUCTURE_RUNTIME__.template(frequency) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 222) + __MARKET_STRUCTURE_RUNTIME__.template(r[__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 223)]) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 224) + __MARKET_STRUCTURE_RUNTIME__.template(col) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 225)
      });
    }
  }
  function csvRows(rows, cols = columns) {
    const esc = v => __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 226) + String(v ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 227)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 228), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 229)), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 230)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 231);
    return [cols.map(esc).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 232)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 233), ...Array.from(rows, r => cols.map(k => esc(r[k])).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 234)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 235))];
  }
  function save(name, parts, type) {
    const u = URL.createObjectURL(new Blob(parts, {
      type
    })), a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 236));
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 237));
  }
  function archive() {
    const sections = {};
    for (const s of document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 238))) if (s.id) sections[s.id] = JSON.parse(s.textContent);
    return {
      schema_version: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 239),
      exported_at: new Date().toISOString(),
      description: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 240),
      DB,
      sections,
      data_dictionary: {
        observation_columns: columns,
        period: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 241),
        value: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 242),
        role: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 243),
        metric_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 244),
        sources: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 245),
        missing: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 246),
        normalization_limit: __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 247)
      }
    };
  }
  const panel = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 248));
  panel.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 249);
  panel.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 250);
  panel.hidden = true;
  get(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 251)).before(panel);
  function render() {
    panel.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 252);
    get(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 253)).onclick = () => {
      const parts = csvRows(observations());
      save(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 254), parts, __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 255));
      get(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 256)).textContent = (parts.length - __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 257)).toLocaleString() + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 258);
    };
    get(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 259)).onclick = () => {
      save(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 260), [JSON.stringify(archive())], __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 261));
      get(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 262)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 263);
    };
    get(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 264)).onclick = () => {
      const rows = (window.Consensus?.data?.focus?.research || []).map(r => ({
        record_id: r.research_id || r.message_id,
        company: JSON.stringify(r.tickers || r.company || r.ticker || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 265)),
        category: r.category || r.note_type || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 266),
        source: r.firm || r.sender || r.source || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 267),
        date: r.source_date || r.date || r.received_at || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 268),
        takeaway: r.short_takeaway || r.takeaway || r.summary || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 269),
        url: r.url || __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 270),
        original_record: JSON.stringify(r)
      }));
      save(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 271), csvRows(rows, [__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 272), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 273), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 274), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 275), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 276), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 277), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 278), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 279)]), __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 280));
      get(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 281)).textContent = rows.length + __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 282);
    };
  }
  const button = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 283));
  button.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 284);
  button.textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 285);
  button.onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 286));
  get(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 287)).appendChild(button);
  const old = setTab;
  setTab = function (t) {
    old(t);
    panel.hidden = t !== __MARKET_STRUCTURE_RUNTIME__.literal("module-021", 288);
    if (!panel.hidden) {
      document.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-021", 289)).hidden = true;
      render();
    }
  };
  window.PortalData = {
    observations,
    csvRows,
    archive,
    render,
    columns
  };
})();
