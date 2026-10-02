// Reviewed presentation code; literal content is supplied by private storage.
(() => {
  const research = window.Consensus.data.focus.research;
  const hoodMetrics = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 0),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 1),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 2),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 3),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 4),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 5),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 6),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 7),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 8),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 9),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 10),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 11),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-012", 12), __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 13), __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 14), __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 15), __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 16), __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 17)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 18),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 19),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 20),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 21),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 22),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 23),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 24),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 25),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 26),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 27),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 28),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 29),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 30)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 31),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 32),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 33),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 34)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 35),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 36),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 37),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 38)
    }]
  };
  const kalshiMargin = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 39),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 40),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 41),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 42),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 43),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 44),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 45),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 46),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 47),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 48),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 49),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 50),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-012", 51), __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 52), __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 53), __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 54), __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 55)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 56),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 57),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 58),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 59),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 60),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 61),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 62),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 63),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 64)
  };
  for (const record of [hoodMetrics, kalshiMargin]) if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 65);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 66);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 67);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 68);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-012", 69);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-012", 70));
  }
})();
