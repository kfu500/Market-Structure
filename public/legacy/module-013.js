// Reviewed presentation code; literal content is supplied by private storage.
(() => {
  const research = window.Consensus?.data?.focus?.research;
  if (!research) return;
  const records = [{
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 0),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 1),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 2),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 3),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 4),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 5),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 6),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 7),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 8),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 9),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 10),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 11),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-013", 12), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 13), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 14), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 15), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 16)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 17),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 18),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 19),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 20),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 21),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 22),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 23),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 24),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 25),
    related_sources: [{
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 26),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 27),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 28),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 29)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 30),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 31),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 32),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 33)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 34),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 35),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 36),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 37)
    }, {
      title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 38),
      date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 39),
      url: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 40),
      source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 41)
    }]
  }, {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 42),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 43),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 44),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 45),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 46),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 47),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 48),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 49),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 50),
    companies: [__MARKET_STRUCTURE_RUNTIME__.literal("module-013", 51), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 52), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 53)],
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 54),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 55),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 56),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-013", 57), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 58), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 59), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 60)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 61),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 62),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 63),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 64),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 65),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 66),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 67),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 68),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 69)
  }, {
    message_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 70),
    sender: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 71),
    sender_name: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 72),
    received_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 73),
    title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 74),
    date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 75),
    url: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 76),
    research_id: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 77),
    company: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 78),
    provider: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 79),
    source_type: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 80),
    period: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 81),
    kpis: [__MARKET_STRUCTURE_RUNTIME__.literal("module-013", 82), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 83), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 84), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 85), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 86), __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 87)],
    access: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 88),
    observation: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 89),
    implication: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 90),
    comparison: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 91),
    counterevidence: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 92),
    test: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 93),
    report_title: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 94),
    report_date: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 95),
    reviewed_at: __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 96)
  }];
  for (const record of records) if (!research.some(x => x.research_id === record.research_id || x.message_id === record.message_id || x.report_title === record.report_title && x.report_date === record.report_date)) research.push(record);
  const watch = window.Consensus.data.focus.research_watch;
  if (watch) {
    watch.last_successful_check_started_at = __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 97);
    watch.window_start = __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 98);
    watch.last_run_search_pages = __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 99);
    watch.last_run_screened_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 100);
    watch.last_run_fetched_messages = __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 101);
    watch.coverage = __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 102);
    watch.access_limits = __MARKET_STRUCTURE_RUNTIME__.literal("module-013", 103);
    watch.deduplication_notes = watch.deduplication_notes || [];
    watch.deduplication_notes.push(__MARKET_STRUCTURE_RUNTIME__.literal("module-013", 104));
  }
})();
