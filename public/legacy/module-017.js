// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  "use strict";
  const d = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 0)).textContent), $x = id => document.getElementById(id), e = x => String(x ?? __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 1)).replace(new __MARKET_STRUCTURE_RUNTIME__.RegExp(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 2), __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 3)), c => ({
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 4)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 5),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 6)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 7),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 8)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 9),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 10)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 11),
    [__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 12)]: __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 13)
  })[c]);
  const panel = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 14));
  panel.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 15);
  panel.hidden = true;
  $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 16)).before(panel);
  const tab = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 17));
  tab.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 18);
  tab.dataset.tab = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 19);
  tab.textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 20);
  document.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 21)).after(tab);
  const nav = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 22));
  nav.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 23);
  nav.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 24);
  nav.dataset.section = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 25);
  nav.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 26);
  $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 27)).appendChild(nav);
  const tabs = document.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 28)), snapshot = document.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 29));
  function sources(x) {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 30) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.boundary)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 31) + __MARKET_STRUCTURE_RUNTIME__.template(x.sources.map(v => __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 32) + __MARKET_STRUCTURE_RUNTIME__.template(e(v.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 33) + __MARKET_STRUCTURE_RUNTIME__.template(e(v.url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 34) + __MARKET_STRUCTURE_RUNTIME__.template(e(v.title)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 35)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 36))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 37);
  }
  function research(t) {
    return d.email_evidence.filter(x => x.companies.includes(t));
  }
  function render(t) {
    const x = d.companies[t];
    panel.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 38) + __MARKET_STRUCTURE_RUNTIME__.template(e(t)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 39) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.role)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 40) + __MARKET_STRUCTURE_RUNTIME__.template(d.checked_at) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 41) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.view)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 42) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.status)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 43) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.economics)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 44) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.watch)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 45) + __MARKET_STRUCTURE_RUNTIME__.template(window.PredictionMarkets.brokerCompany(t)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 46) + __MARKET_STRUCTURE_RUNTIME__.template(research(t).length) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 47) + __MARKET_STRUCTURE_RUNTIME__.template(research(t).map(n => __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 48) + __MARKET_STRUCTURE_RUNTIME__.template(e(n.source_type)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 49) + __MARKET_STRUCTURE_RUNTIME__.template(e(n.provider)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 50) + __MARKET_STRUCTURE_RUNTIME__.template(e(n.report_date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 51) + __MARKET_STRUCTURE_RUNTIME__.template(e(n.short_takeaway)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 52) + __MARKET_STRUCTURE_RUNTIME__.template(e(n.observation)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 53) + __MARKET_STRUCTURE_RUNTIME__.template(e(n.url)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 54) + __MARKET_STRUCTURE_RUNTIME__.template(e(n.access)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 55)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 56))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 57) + __MARKET_STRUCTURE_RUNTIME__.template(sources(x)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 58);
    $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 59)).onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 60));
  }
  function overview() {
    return __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 61) + __MARKET_STRUCTURE_RUNTIME__.template(Object.entries(d.companies).map(([t, x]) => __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 62) + __MARKET_STRUCTURE_RUNTIME__.template(t) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 63) + __MARKET_STRUCTURE_RUNTIME__.template(t) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 64) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.role)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 65) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.view)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 66) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.status)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 67) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.economics)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 68) + __MARKET_STRUCTURE_RUNTIME__.template(e(x.watch)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 69)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 70))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 71);
  }
  function bind(p) {
    p.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 72)).forEach(b => b.onclick = () => {
      state.company = b.dataset.pmCompany;
      setupCompany();
      setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 73));
    });
  }
  let globalActive = false;
  function globalHeader() {
    tabs.hidden = true;
    snapshot.hidden = true;
    document.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 74)).forEach(b => {
      const on = b.id === __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 75);
      b.classList.toggle(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 76), on);
      b.setAttribute(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 77), on ? __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 78) : __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 79));
    });
    $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 80)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 81);
    $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 82)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 83);
    $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 84)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 85);
  }
  const previous = setTab;
  setTab = function (name, reset) {
    if (globalActive && name !== __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 86)) {
      tabs.hidden = false;
      snapshot.hidden = false;
      const p = DB.profiles[state.company];
      $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 87)).textContent = p.name;
      $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 88)).textContent = state.company + __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 89);
      $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 90)).textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 91);
    }
    globalActive = name === __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 92);
    previous(name, reset);
    panel.hidden = name !== __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 93);
    if (globalActive) globalHeader();
    if (name === __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 94)) {
      $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 95)).hidden = true;
      $x(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 96)).open = false;
      render(state.company);
    }
  };
  const setup = setupCompany;
  setupCompany = function () {
    const keep = state.tab === __MARKET_STRUCTURE_RUNTIME__.literal("module-017", 97);
    globalActive = false;
    tabs.hidden = false;
    snapshot.hidden = false;
    setup();
    if (keep) setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 98));
  };
  tab.onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 99));
  nav.onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-017", 100));
  window.PredictionExposure = {
    data: d,
    render,
    overview,
    bind
  };
})();
