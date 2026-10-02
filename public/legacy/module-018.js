// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  const E = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-018", 0)).textContent), a = window.Consensus.data.focus.research;
  const seen = new Set(a.map(r => r.company + __MARKET_STRUCTURE_RUNTIME__.literal("module-018", 1) + (r.message_id || r.url)));
  E.registration = {
    added: [],
    already_present: []
  };
  for (const r of E.new_observations) {
    const k = r.company + __MARKET_STRUCTURE_RUNTIME__.literal("module-018", 2) + (r.message_id || r.url);
    if (seen.has(k)) {
      E.registration.already_present.push(r.research_id);
      continue;
    }
    a.push(r);
    seen.add(k);
    E.registration.added.push(r.research_id);
  }
  window.TrendEditorial = E;
})();
