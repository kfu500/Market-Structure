// Reviewed presentation code; literal content is supplied by private storage.
(() => {
  const research = window.Consensus.data.focus.research;
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 0),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 1),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 2),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 3),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 4),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 5),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 6),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 7),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 8),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 9),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 10),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 11),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-010", 12), __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 13), __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 14), __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 15), __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 16), __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 17), __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 18)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 19),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 20),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 21),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 22),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 23),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 24),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 25),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 26),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 27)
  };
  if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 28);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 29);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 30);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 31);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-010", 32);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-010", 33));
  }
})();
