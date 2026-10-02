const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const styleProperties = [
  'color', 'display', 'visibility', 'opacity', 'fill', 'fill-opacity', 'fill-rule',
  'stroke', 'stroke-opacity', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset', 'paint-order',
  'font-family', 'font-size', 'font-style', 'font-weight', 'font-variant',
  'letter-spacing', 'word-spacing', 'text-anchor', 'dominant-baseline',
  'alignment-baseline', 'text-decoration', 'vector-effect', 'shape-rendering',
  'stop-color', 'stop-opacity', 'flood-color', 'flood-opacity', 'lighting-color',
  'clip-path', 'clip-rule', 'mask', 'filter', 'marker-start', 'marker-mid', 'marker-end',
];

function visibleChart(root) {
  if (!root?.querySelectorAll) throw new Error('Open the portal before exporting a chart.');
  for (const svg of root.querySelectorAll('svg')) {
    const bounds = svg.getBoundingClientRect();
    // Ignore navigation icons and charts in hidden tabs. Off-screen charts in
    // the active page remain exportable without requiring the user to scroll.
    if (bounds.width < 120 || bounds.height < 60 || !svg.getClientRects().length
      || (typeof svg.checkVisibility === 'function' && !svg.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))
      || !svg.querySelector('path,polyline,polygon,line,rect,circle,ellipse,text')) continue;
    const style = getComputedStyle(svg);
    if (style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0) return { svg, bounds };
  }
  throw new Error('No visible chart is available. Open a chart page, then try Export chart again.');
}

/** Only references to IDs inside the selected SVG may survive serialization. */
function localReferences(value, ids, documentUrl) {
  let invalid = false;
  const rewritten = value.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (_, quote, reference) => {
    let id;
    if (reference.startsWith('#')) id = reference.slice(1);
    else {
      try {
        const target = new URL(reference, documentUrl);
        const current = new URL(documentUrl);
        if (target.origin === current.origin && target.pathname === current.pathname && target.search === current.search) id = target.hash.slice(1);
      } catch { /* Unsupported references are omitted from the output. */ }
    }
    if (!id || !/^[A-Za-z_][\w:.-]*$/.test(id) || !ids.has(id)) { invalid = true; return ''; }
    return `url(#${id})`;
  });
  return invalid ? '' : rewritten;
}

function serializeChart(svg, bounds) {
  const clone = svg.cloneNode(true);
  const originals = [svg, ...svg.querySelectorAll('*')];
  const copies = [clone, ...clone.querySelectorAll('*')];
  // Export geometry and labels only. No uploaded script, embedded document,
  // external image, stylesheet or remote font becomes part of the PNG process.
  for (const node of clone.querySelectorAll('script,foreignObject,image,iframe,object,embed,link,style,animate,animateMotion,animateTransform,set')) node.remove();
  const ids = new Set([clone, ...clone.querySelectorAll('[id]')].map(node => node.id).filter(Boolean));
  for (let index = 0; index < copies.length; index++) {
    const copy = copies[index];
    if (copy !== clone && !clone.contains(copy)) continue;
    for (const attribute of [...copy.attributes]) {
      const name = attribute.name.toLowerCase();
      if (/^on/.test(name) || ['style', 'src', 'xml:base'].includes(name)) copy.removeAttribute(attribute.name);
      else if (name === 'href' || name === 'xlink:href') {
        if (!attribute.value.startsWith('#') || !ids.has(attribute.value.slice(1))) copy.removeAttribute(attribute.name);
      } else if (/url\s*\(/i.test(attribute.value)) {
        const value = localReferences(attribute.value, ids, svg.ownerDocument.URL);
        if (value) copy.setAttribute(attribute.name, value);
        else copy.removeAttribute(attribute.name);
      }
    }
    const computed = getComputedStyle(originals[index]);
    for (const property of styleProperties) {
      const value = localReferences(computed.getPropertyValue(property), ids, svg.ownerDocument.URL);
      if (value) copy.style.setProperty(property, value);
    }
  }
  clone.setAttribute('xmlns', SVG_NAMESPACE);
  clone.setAttribute('width', String(bounds.width));
  clone.setAttribute('height', String(bounds.height));
  if (!clone.hasAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
  return new XMLSerializer().serializeToString(clone);
}

async function loadLocalImage(url) {
  const image = new Image();
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => finish(false), 15_000);
    function finish(success) {
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      if (success) resolve();
      else reject(new Error('This browser could not render the chart image. Try Print / PDF instead.'));
    }
    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    image.src = url;
  });
  return image;
}

/** Render the first visible chart to a PNG in memory; no network request is made. */
export async function createChartPng({ root = document.getElementById('legacy-root'), scale = 2 } = {}) {
  if (!Number.isFinite(scale) || scale <= 0 || scale > 4) throw new Error('Choose a chart export scale between 0 and 4.');
  const { svg, bounds } = visibleChart(root);
  const width = Math.ceil(bounds.width * scale);
  const height = Math.ceil(bounds.height * scale);
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width * height > 16_000_000) {
    throw new Error('This chart is too large to export as an image. Try Print / PDF instead.');
  }
  const source = serializeChart(svg, bounds);
  const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = await loadLocalImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Chart image export is unavailable in this browser. Try Print / PDF instead.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise((resolve, reject) => {
      try {
        canvas.toBlob(value => value ? resolve(value) : reject(new Error('Unable to encode the chart image.')), 'image/png');
      } catch { reject(new Error('Unable to encode the chart image.')); }
    });
    return { blob, width, height };
  } finally { URL.revokeObjectURL(url); }
}

/** Download a PNG of the first visible chart. The caller displays safe errors. */
export async function exportVisibleChart({ filename = 'Market-Structure-Chart.png', ...options } = {}) {
  if (typeof filename !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9 ._-]{0,120}\.png$/i.test(filename)) {
    throw new Error('Choose a simple filename ending in .png.');
  }
  const { blob, width, height } = await createChartPng(options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename;
  document.body.append(link);
  try { link.click(); }
  finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
  return { filename, width, height };
}
