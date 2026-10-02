// Reviewed presentation code; literal content is supplied by private storage.
window.RecentNotes = (() => {
  const e = window.PortalNoteGroups ? v => String(v ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 0)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 1), __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 2)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 3)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 4),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 5)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 6),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 7)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 8),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 9)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 10),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 11)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 12)
  })[c]) : String;
  const extra = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 13)).textContent);
  const key = r => r.research_id || r.message_id || r.url + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 14) + r.title;
  const records = () => window.Consensus.data.focus.research;
  for (const r of extra.additional_notes) if (!records().some(x => key(x) === key(r))) records().push(r);
  const firmKey = r => (r.sender && r.sender.includes(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 15)) ? r.sender : r.provider || __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 16)).toLowerCase().replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 17), __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 18)), __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 19)).trim();
  const stamp = r => [r.report_date || r.date || __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 20), r.received_at || __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 21)].join(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 22));
  function takeaway(r) {
    const saved = extra.takeaways[key(r)];
    return r.short_takeaway || (saved && saved.observation === r.observation ? saved.takeaway : r.title) || r.observation || __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 23);
  }
  function groups(ticker) {
    const rows = records().filter(r => window.PortalNoteGroups.applies(r, ticker));
    return window.PortalNoteGroups.groups(rows).map(g => {
      const firms = new Map();
      for (const r of g.rows) {
        const id = firmKey(r);
        if (!firms.has(id)) firms.set(id, []);
        firms.get(id).push(r);
      }
      return {
        ...g,
        firms: [...firms.values()].map(rs => rs.sort((a, b) => stamp(b).localeCompare(stamp(a)))).sort((a, b) => stamp(b[__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 24)]).localeCompare(stamp(a[__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 25)])))
      };
    });
  }
  function details(r) {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 26) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 27) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.report_title || r.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 28) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.provider)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 29) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.report_date || r.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 30) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.source_type || __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 31))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 32) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.observation)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 33) + __MARKET_STRUCTURE_RUNTIME__.template(r.period ? __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 34) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.period)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 35) : __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 36)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 37) + __MARKET_STRUCTURE_RUNTIME__.template(r.access ? __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 38) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.access)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 39) : __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 40)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 41) + __MARKET_STRUCTURE_RUNTIME__.template(r.counterevidence ? __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 42) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.counterevidence)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 43) : __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 44)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 45);
  }
  function render(ticker) {
    const gs = groups(ticker);
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 46)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 47) + __MARKET_STRUCTURE_RUNTIME__.template(e(ticker)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 48) + __MARKET_STRUCTURE_RUNTIME__.template(gs.map(g => __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 49) + __MARKET_STRUCTURE_RUNTIME__.template(g.id) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 50) + __MARKET_STRUCTURE_RUNTIME__.template(e(g.label)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 51) + __MARKET_STRUCTURE_RUNTIME__.template(g.firms.length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 52) + __MARKET_STRUCTURE_RUNTIME__.template(g.firms.length ? __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 53) + __MARKET_STRUCTURE_RUNTIME__.template(g.firms.map(rs => {
      const r = rs[__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 54)];
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 55) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.provider)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 56) + __MARKET_STRUCTURE_RUNTIME__.template(e(r.report_date || r.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 57) + __MARKET_STRUCTURE_RUNTIME__.template(e(takeaway(r))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 58) + __MARKET_STRUCTURE_RUNTIME__.template(rs.length > __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 59) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 60) + (rs.length - __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 61)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 62) + (rs.length > __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 63) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 64) : __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 65)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 66)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 67) + __MARKET_STRUCTURE_RUNTIME__.template(rs.map(details).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 68))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 69);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 70))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 71) : __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 72)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 73)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 74))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 75);
  }
  return {
    render,
    groups,
    takeaway,
    records
  };
})();
(() => {
  const previousTab = setTab, previousSetup = setupCompany;
  setTab = function (tab, reset = false) {
    previousTab(tab, reset);
    $(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 76)).hidden = tab !== __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 77);
    if (tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 78)) {
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 79)).open = false;
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 80)).hidden = true;
      $(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 81)).hidden = true;
      window.RecentNotes.render(state.company);
    }
  };
  setupCompany = function () {
    const keep = state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-014", 82);
    previousSetup();
    if (keep) setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-014", 83));
  };
})();
