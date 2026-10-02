// Reviewed presentation code; literal content is supplied by private storage.
(function () {
  "use strict";
  const data = JSON.parse(document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 0)).textContent);
  const rows = data.daily;
  const map = new Map(rows.map(r => [r.date, r]));
  const million = x => (x / __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 1)).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 2)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 3);
  const shift = (day, n) => new Date(Date.parse(day + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 4)) + n * __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 5)).toISOString().slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 6), __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 7));
  function avg(day, n) {
    const values = Array.from({
      length: n
    }, (_, i) => map.get(shift(day, -i)));
    return values.every(Boolean) ? values.reduce((s, r) => s + r.volume, __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 8)) / n : null;
  }
  function exportData(kind) {
    const audit = kind === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 9);
    const csv = [[__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 10), __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 11), __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 12), __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 13), __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 14), __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 15), __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 16)], ...rows.map(r => [r.date, r.volume, avg(r.date, __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 17)), r.oi, r.trade_count, r.source_url, r.sha256])].map(r => r.map(csvCell).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 18))).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 19));
    const blob = new Blob([audit ? JSON.stringify(data, null, __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 20)) : __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 21) + csv], {
      type: audit ? __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 22) : __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 23)
    });
    const url = URL.createObjectURL(blob), a = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 24));
    a.href = url;
    a.download = audit ? __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 25) + __MARKET_STRUCTURE_RUNTIME__.template(rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 26)).date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 27) : __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 28) + __MARKET_STRUCTURE_RUNTIME__.template(rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 29)).date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 30);
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 31));
  }
  const tab = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 32));
  tab.className = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 33);
  tab.dataset.tab = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 34);
  tab.textContent = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 35);
  document.querySelector(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 36)).after(tab);
  const panel = document.createElement(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 37));
  panel.id = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 38);
  panel.hidden = true;
  document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 39)).before(panel);
  let selected = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 40);
  function chart() {
    const points = rows.map(r => ({
      date: r.date,
      value: selected === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 41) ? r.volume : selected === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 42) ? r.oi : avg(r.date, __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 43))
    })).filter(r => r.value !== null);
    const W = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 44), H = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 45), L = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 46), R = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 47), T = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 48), B = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 49);
    const max = Math.ceil(Math.max(...points.map(p => p.value)) / __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 50)) * __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 51);
    const x = d => L + (Date.parse(d) - Date.parse(rows[__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 52)].date)) / (Date.parse(rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 53)).date) - Date.parse(rows[__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 54)].date)) * (W - L - R);
    const y = v => H - B - v / max * (H - T - B);
    const label = selected === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 55) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 56) : selected === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 57) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 58) : __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 59);
    const lines = Array.from({
      length: __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 60)
    }, (_, i) => {
      const v = max * i / __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 61);
      return __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 62) + __MARKET_STRUCTURE_RUNTIME__.template(L) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 63) + __MARKET_STRUCTURE_RUNTIME__.template(W - R) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 64) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 65) + __MARKET_STRUCTURE_RUNTIME__.template(y(v)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 66) + __MARKET_STRUCTURE_RUNTIME__.template(L - __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 67)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 68) + __MARKET_STRUCTURE_RUNTIME__.template(y(v) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 69)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 70) + __MARKET_STRUCTURE_RUNTIME__.template((v / __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 71)).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 72))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 73);
    }).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 74));
    const labels = rows.filter((_, i) => i % __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 75) === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 76)).map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 77) + __MARKET_STRUCTURE_RUNTIME__.template(x(r.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 78) + __MARKET_STRUCTURE_RUNTIME__.template(H - __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 79)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 80) + __MARKET_STRUCTURE_RUNTIME__.template(r.date.slice(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 81))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 82)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 83));
    const dots = points.map(p => __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 84) + __MARKET_STRUCTURE_RUNTIME__.template(x(p.date)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 85) + __MARKET_STRUCTURE_RUNTIME__.template(y(p.value)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 86) + __MARKET_STRUCTURE_RUNTIME__.template(p.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 87) + __MARKET_STRUCTURE_RUNTIME__.template(p.value.toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 88), {
      maximumFractionDigits: __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 89)
    })) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 90) + __MARKET_STRUCTURE_RUNTIME__.template(selected === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 91) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 92) : __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 93)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 94)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 95));
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 96)).innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 97) + __MARKET_STRUCTURE_RUNTIME__.template(label) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 98) + __MARKET_STRUCTURE_RUNTIME__.template(selected === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 99) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 100) : __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 101)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 102) + __MARKET_STRUCTURE_RUNTIME__.template(W) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 103) + __MARKET_STRUCTURE_RUNTIME__.template(H) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 104) + __MARKET_STRUCTURE_RUNTIME__.template(label) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 105) + __MARKET_STRUCTURE_RUNTIME__.template(rows[__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 106)].date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 107) + __MARKET_STRUCTURE_RUNTIME__.template(rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 108)).date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 109) + __MARKET_STRUCTURE_RUNTIME__.template(lines) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 110) + __MARKET_STRUCTURE_RUNTIME__.template(labels) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 111) + __MARKET_STRUCTURE_RUNTIME__.template(points.map(p => x(p.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 112) + y(p.value)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 113))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 114) + __MARKET_STRUCTURE_RUNTIME__.template(dots) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 115);
    panel.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 116)).forEach(b => {
      b.classList.toggle(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 117), b.dataset.rotheraView === selected);
      b.setAttribute(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 118), String(b.dataset.rotheraView === selected));
    });
  }
  function render() {
    const s = data.summary, last = rows.at(-__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 119)), week = avg(last.date, __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 120)), prior = avg(shift(last.date, -__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 121)), __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 122)), change = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 123) * (week / prior - __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 124));
    panel.innerHTML = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 125) + __MARKET_STRUCTURE_RUNTIME__.template(last.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 126) + __MARKET_STRUCTURE_RUNTIME__.template(s.calendar_days) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 127) + __MARKET_STRUCTURE_RUNTIME__.template(Number(last.date.slice(-__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 128)))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 129) + __MARKET_STRUCTURE_RUNTIME__.template(million(last.volume)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 130) + __MARKET_STRUCTURE_RUNTIME__.template(last.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 131) + __MARKET_STRUCTURE_RUNTIME__.template(million(week)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 132) + __MARKET_STRUCTURE_RUNTIME__.template(s.latest_complete_7_day_window.join(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 133))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 134) + __MARKET_STRUCTURE_RUNTIME__.template(change.toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 135))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 136) + __MARKET_STRUCTURE_RUNTIME__.template(s.preceding_7_day_window.join(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 137))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 138) + __MARKET_STRUCTURE_RUNTIME__.template(million(s.september_adv_through_cutoff)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 139) + __MARKET_STRUCTURE_RUNTIME__.template(last.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 140) + __MARKET_STRUCTURE_RUNTIME__.template(million(last.oi)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 141) + __MARKET_STRUCTURE_RUNTIME__.template(last.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 142) + __MARKET_STRUCTURE_RUNTIME__.template(change >= __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 143) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 144) : __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 145)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 146) + __MARKET_STRUCTURE_RUNTIME__.template(Math.abs(change).toFixed(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 147))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 148) + __MARKET_STRUCTURE_RUNTIME__.template(change >= __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 149) ? __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 150) : __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 151)) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 152) + __MARKET_STRUCTURE_RUNTIME__.template([...rows].reverse().map(r => __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 153) + __MARKET_STRUCTURE_RUNTIME__.template(r.source_url) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 154) + __MARKET_STRUCTURE_RUNTIME__.template(r.date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 155) + __MARKET_STRUCTURE_RUNTIME__.template(r.volume.toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 156))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 157) + __MARKET_STRUCTURE_RUNTIME__.template(avg(r.date, __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 158)) === null ? __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 159) : Math.round(avg(r.date, __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 160))).toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 161))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 162) + __MARKET_STRUCTURE_RUNTIME__.template(r.oi.toLocaleString(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 163))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 164)).join(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 165))) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 166) + __MARKET_STRUCTURE_RUNTIME__.template(data.import_date) + __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 167);
    panel.querySelectorAll(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 168)).forEach(b => b.onclick = () => {
      selected = b.dataset.rotheraView;
      chart();
    });
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 169)).onclick = () => exportData(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 170));
    document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 171)).onclick = () => exportData(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 172));
    chart();
  }
  const previousSetTab = setTab;
  setTab = function (name, reset) {
    if (name === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 173) && state.company !== __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 174)) name = __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 175);
    previousSetTab(name, reset);
    panel.hidden = name !== __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 176);
    tab.hidden = state.company !== __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 177);
    if (name === __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 178)) {
      document.getElementById(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 179)).open = false;
      render();
    }
  };
  tab.onclick = () => setTab(__MARKET_STRUCTURE_RUNTIME__.literal("module-008", 180));
  tab.hidden = state.company !== __MARKET_STRUCTURE_RUNTIME__.literal("module-008", 181);
  window.RotheraTracker = {
    data,
    avg
  };
})();
