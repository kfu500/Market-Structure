// Reviewed presentation code; literal content is supplied by private storage.
(() => {
  const root = document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 0));
  document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 1)).addEventListener(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 2), () => document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 3)).forEach(x => x.open = true));
  document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 4)).addEventListener(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 5), () => document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 6)).forEach(x => x.open = false));
  document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 7)).addEventListener(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 8), () => {
    const blob = new Blob([document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 9)).textContent], {
      type: __MARKET_STRUCTURE_RUNTIME__.literal("module-007", 10)
    }), u = URL.createObjectURL(blob), a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-007", 11));
    a.href = u;
    a.download = __MARKET_STRUCTURE_RUNTIME__.literal("module-007", 12);
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), __MARKET_STRUCTURE_RUNTIME__.literal("module-007", 13));
  });
})();
