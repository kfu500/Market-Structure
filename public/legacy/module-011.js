// Reviewed presentation code; literal content is supplied by private storage.
(() => {
  const research = window.Consensus.data.focus.research;
  const record = {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 0),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 1),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 2),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 3),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 4),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 5),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 6),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 7),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 8),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 9),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 10),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 11),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-011", 12), __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 13), __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 14), __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 15), __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 16), __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 17)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 18),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 19),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 20),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 21),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 22),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 23),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 24),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 25),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 26),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 27),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 28),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 29),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 30)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 31),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 32),
      library_file_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 33),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 34)
    }]
  };
  if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 35);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 36);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 37);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 38);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-011", 39);
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-011", 40));
  }
})();
