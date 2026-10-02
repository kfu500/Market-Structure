// Reviewed presentation code; literal content is supplied by private storage.
window.PortalNoteGroups = (() => {
  const labels = [[__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 0), __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 1)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 2), __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 3)], [__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 4), __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 5)]];
  const escape = v => String(v ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 6)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 7), __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 8)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 9)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 10),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 11)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 12),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 13)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 14),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 15)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 16),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 17)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 18)
  })[c]);
  function category(r) {
    const type = r.source_type || __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 19), provider = r.provider || __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 20);
    if (new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 21), __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 22)).test(type + __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 23) + provider) || r.research_id === __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 24)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 25);
    if (new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 26), __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 27)).test(type)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 28);
    if (new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 29), __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 30)).test(type + __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 31) + provider)) return __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 32);
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 33);
  }
  function applies(r, ticker) {
    const names = r.companies?.length ? r.companies : String(r.company || __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 34)).match(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 35), __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 36))) || [];
    return names.includes(ticker);
  }
  const dateKey = r => String(r.report_date || r.date || r.received_at || __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 37));
  function groups(rows) {
    return labels.map(([id, label]) => ({
      id,
      label,
      rows: rows.filter(r => category(r) === id).map((r, i) => ({
        r,
        i
      })).sort((a, b) => dateKey(b.r).localeCompare(dateKey(a.r)) || a.i - b.i).map(x => x.r)
    }));
  }
  function render(rows, renderNote) {
    return groups(rows).map(g => __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 38) + __MARKET_STRUCTURE_RUNTIME__.template(g.id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 39) + __MARKET_STRUCTURE_RUNTIME__.template(escape(g.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 40) + __MARKET_STRUCTURE_RUNTIME__.template(g.rows.length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 41) + __MARKET_STRUCTURE_RUNTIME__.template(g.rows.length ? g.rows.map(renderNote).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 42)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 43)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-000", 44)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-000", 45));
  }
  return {
    category,
    applies,
    groups,
    render
  };
})();
