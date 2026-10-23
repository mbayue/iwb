const fs = require('fs');
const path = require('path');
const config = require('./config');

const W = 1920, H = 1080;
const minLon = 95.0, maxLon = 141.05;
const minLat = -11.0, maxLat = 6.0;
const dLon = maxLon - minLon;
const dLat = maxLat - minLat;

const mapX = 30;
const mapY = 220;
const mapW = 1480;
const scale = mapW / dLon;
const mapH = dLat * scale;

function project(lon, lat) {
  const x = mapX + (lon - minLon) * scale;
  const y = mapY + (maxLat - lat) * scale;
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

function ringToPath(ring) {
  return ring.map((pt, i) => (i === 0 ? 'M' : 'L') + project(pt[0], pt[1]).join(',')).join(' ') + ' Z';
}

function geomToPath(geom) {
  if (geom.type === 'Polygon') {
    return geom.coordinates.map(ringToPath).join(' ');
  } else if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map(poly => poly.map(ringToPath).join(' ')).join(' ');
  }
  return '';
}

function getPoints(coords) {
  const pts = [];
  function scan(pt) {
    if (typeof pt[0] === 'number') pts.push(pt);
    else pt.forEach(scan);
  }
  scan(coords);
  return pts;
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return '#' + f(0) + f(8) + f(4);
}

function buildGraph() {
  if (!fs.existsSync(config.PATHS.GEOJSON)) {
    throw new Error(`GeoJSON not found at ${config.PATHS.GEOJSON}`);
  }

  const rawData = JSON.parse(fs.readFileSync(config.PATHS.GEOJSON, 'utf8'));
  const N = rawData.features.length;

  const territories = [];
  const vertexMap = new Map();

  for (let idx = 0; idx < N; idx++) {
    const f = rawData.features[idx];
    const pts = getPoints(f.geometry.coordinates);

    let sx = 0, sy = 0;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      sx += p[0]; sy += p[1];
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    }

    const cLon = sx / pts.length;
    const cLat = sy / pts.length;
    const [cScreenX, cScreenY] = project(cLon, cLat);

    const h = (idx * 137.50776405) % 360;
    const s = 45 + (idx % 4) * 4;
    const l = 43 + ((idx % 3) - 1) * 4;
    const color = hslToHex(h, s, l);

    const sampledPts = pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 60)) === 0);

    territories.push({
      id: idx,
      name: f.properties.WADMKK,
      province: f.properties.WADMPR,
      cLon,
      cLat,
      cScreen: [cScreenX, cScreenY],
      bbox: [minX, minY, maxX, maxY],
      color,
      pathD: geomToPath(f.geometry),
      sampledPts
    });

    for (const pt of pts) {
      const key = pt[0].toFixed(4) + ',' + pt[1].toFixed(4);
      if (!vertexMap.has(key)) vertexMap.set(key, new Set());
      vertexMap.get(key).add(idx);
    }
  }

  const adj = Array.from({ length: N }, () => new Set());
  for (const [, tSet] of vertexMap) {
    if (tSet.size > 1) {
      const arr = Array.from(tSet);
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          adj[arr[i]].add(arr[j]);
          adj[arr[j]].add(arr[i]);
        }
      }
    }
  }

  function minPtsDist(i, j) {
    let minD2 = Infinity;
    const p1 = territories[i].sampledPts;
    const p2 = territories[j].sampledPts;
    for (let a = 0; a < p1.length; a++) {
      for (let b = 0; b < p2.length; b++) {
        const dx = p1[a][0] - p2[b][0];
        const dy = p1[a][1] - p2[b][1];
        const d2 = dx * dx + dy * dy;
        if (d2 < minD2) minD2 = d2;
      }
    }
    return Math.sqrt(minD2);
  }

  // Connect isolated islands
  for (let i = 0; i < N; i++) {
    if (adj[i].size === 0) {
      const dists = [];
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        dists.push({ j, d: minPtsDist(i, j) });
      }
      dists.sort((a, b) => a.d - b.d);
      adj[i].add(dists[0].j);
      adj[dists[0].j].add(i);
      adj[i].add(dists[1].j);
      adj[dists[1].j].add(i);
    }
  }

  // Key strategic straits
  function linkByName(name1, name2) {
    const i1 = territories.findIndex(t => t.name === name1);
    const i2 = territories.findIndex(t => t.name === name2);
    if (i1 !== -1 && i2 !== -1) {
      adj[i1].add(i2);
      adj[i2].add(i1);
    }
  }

  linkByName('Lampung Selatan', 'Serang');
  linkByName('Lampung Selatan', 'Kota Cilegon');
  linkByName('Banyuwangi', 'Jembrana');
  linkByName('Karangasem', 'Lombok Barat');
  linkByName('Lombok Timur', 'Sumbawa Barat');
  linkByName('Bima', 'Manggarai Barat');
  linkByName('Flores Timur', 'Lembata');
  linkByName('Lembata', 'Alor');
  linkByName('Kupang', 'Rote Ndao');
  linkByName('Kota Surabaya', 'Bangkalan');
  linkByName('Banyuasin', 'Bangka Barat');
  linkByName('Bangka Selatan', 'Belitung');
  linkByName('Belitung', 'Ketapang');
  linkByName('Kotabaru', 'Tanah Bumbu');
  linkByName('Kotabaru', 'Majene');
  linkByName('Balikpapan', 'Mamuju');
  linkByName('Kutai Kartanegara', 'Donggala');
  linkByName('Kota Bitung', 'Halmahera Utara');
  linkByName('Kota Ternate', 'Kota Tidore Kepulauan');
  linkByName('Halmahera Tengah', 'Raja Ampat');
  linkByName('Raja Ampat', 'Kota Sorong');
  linkByName('Kepulauan Seribu', 'Kota Jakarta Utara');
  linkByName('Kota Batam', 'Kota Tanjung Pinang');
  linkByName('Kota Batam', 'Karimun');

  // BFS connectivity check
  function getComponents() {
    const visited = new Set();
    const comps = [];
    for (let i = 0; i < N; i++) {
      if (!visited.has(i)) {
        const comp = [];
        const q = [i];
        visited.add(i);
        while (q.length > 0) {
          const u = q.shift();
          comp.push(u);
          for (const v of adj[u]) {
            if (!visited.has(v)) {
              visited.add(v);
              q.push(v);
            }
          }
        }
        comps.push(comp);
      }
    }
    return comps;
  }

  let comps = getComponents();
  while (comps.length > 1) {
    const c0 = comps[0];
    const c1 = comps[1];
    let best = null, minD = Infinity;
    for (const u of c0) {
      for (const v of c1) {
        const dx = territories[u].cLon - territories[v].cLon;
        const dy = territories[u].cLat - territories[v].cLat;
        const d = dx * dx + dy * dy;
        if (d < minD) {
          minD = d;
          best = [u, v];
        }
      }
    }
    adj[best[0]].add(best[1]);
    adj[best[1]].add(best[0]);
    comps = getComponents();
  }

  const cleanTerritories = territories.map(t => {
    const { sampledPts, ...rest } = t;
    return rest;
  });

  const graphOutput = {
    version: '1.0',
    totalTerritories: N,
    projection: { W, H, mapX, mapY, mapW, mapH, scale, minLon, maxLon, minLat, maxLat },
    territories: cleanTerritories,
    adjacency: adj.map(set => Array.from(set))
  };

  fs.mkdirSync(path.dirname(config.PATHS.GRAPH), { recursive: true });
  fs.writeFileSync(config.PATHS.GRAPH, JSON.stringify(graphOutput));
  return graphOutput;
}

function loadGraph() {
  if (fs.existsSync(config.PATHS.GRAPH)) {
    return JSON.parse(fs.readFileSync(config.PATHS.GRAPH, 'utf8'));
  }
  return buildGraph();
}

module.exports = {
  loadGraph,
  buildGraph
};
