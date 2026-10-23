const { Resvg } = require('@resvg/resvg-js');

const W = 1920, H = 1080;

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderMapSvg(graph, state, battle) {
  const N = graph.totalTerritories;
  const { mapX, mapY, mapW, mapH, scale, minLon, maxLat } = graph.projection;

  // 1. Graticule (Lat/Lon Coordinates & Nautical Grid)
  let gridSvg = '';
  [-10, -5, 0, 5].forEach(lat => {
    const y = mapY + (maxLat - lat) * scale;
    const label = lat === 0 ? '0° KHATULISTIWA' : lat < 0 ? `${Math.abs(lat)}°S` : `${lat}°N`;
    const isEq = lat === 0;
    gridSvg += `
      <line x1="${mapX}" y1="${y}" x2="${mapX + mapW}" y2="${y}" stroke="${isEq ? '#334155' : '#172235'}" stroke-width="${isEq ? 1.2 : 0.8}" stroke-dasharray="${isEq ? '6,6' : '3,6'}"/>
      <text x="${mapX + mapW - 10}" y="${y - 5}" fill="#475569" font-size="10" font-family="monospace" text-anchor="end">${label}</text>
    `;
  });

  [100, 110, 120, 130, 140].forEach(lon => {
    const x = mapX + (lon - minLon) * scale;
    gridSvg += `
      <line x1="${x}" y1="${mapY}" x2="${x}" y2="${mapY + mapH}" stroke="#172235" stroke-width="0.8" stroke-dasharray="3,6"/>
      <text x="${x + 5}" y="${mapY + 18}" fill="#475569" font-size="10" font-family="monospace">${lon}°E</text>
    `;
  });

  // 2. Territories Paths
  let pathsSvg = '';
  for (let i = 0; i < N; i++) {
    const ownerId = state.territoryOwner[i];
    const color = state.factions[ownerId].color;
    const isDef = battle && battle.defTerritory && i === battle.defTerritory.id;
    const isAtk = battle && battle.atkTerritory && i === battle.atkTerritory.id;

    const stroke = isDef ? '#ef4444' : isAtk ? '#38bdf8' : '#080d16';
    const strokeW = isDef ? '2.5' : isAtk ? '2.0' : '0.6';
    pathsSvg += `<path d="${graph.territories[i].pathD}" fill="${color}" stroke="${stroke}" stroke-width="${strokeW}" id="t_${i}"/>\n`;
  }

  // 3. Battle Indicators on Main Map
  let battleMarkerSvg = '';
  let radarInsetSvg = '';

  const rBoxX = 50, rBoxY = 740, rBoxW = 460, rBoxH = 295;
  const rWinX = rBoxX + 15, rWinY = rBoxY + 45, rWinW = rBoxW - 30, rWinH = rBoxH - 60;
  const rCx = rWinX + rWinW / 2;
  const rCy = rWinY + rWinH / 2;

  if (battle && battle.atkTerritory && battle.defTerritory) {
    const [ax, ay] = battle.atkTerritory.cScreen;
    const [dx, dy] = battle.defTerritory.cScreen;
    const defName = escapeXml(battle.defTerritory.name);
    const atkName = escapeXml(battle.atkFaction.name);

    battleMarkerSvg = `
      <line x1="${ax}" y1="${ay}" x2="${dx}" y2="${dy}" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="5,4"/>
      <circle cx="${ax}" cy="${ay}" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="${dx}" cy="${dy}" r="9" fill="none" stroke="#ef4444" stroke-width="2.5"/>
      <circle cx="${dx}" cy="${dy}" r="3" fill="#ef4444"/>
    `;

    // Radar Zoom Inset calculation
    const tCx = (ax + dx) / 2;
    const tCy = (ay + dy) / 2;
    const zoom = 3.4;
    const radarTransform = `translate(${rCx}, ${rCy}) scale(${zoom}) translate(-${tCx}, -${tCy})`;

    radarInsetSvg = `
      <!-- RADAR INSET PANEL (Left Bottom) -->
      <rect x="${rBoxX}" y="${rBoxY}" width="${rBoxW}" height="${rBoxH}" rx="10" fill="#0b1220" stroke="#38bdf8" stroke-width="1.5"/>
      
      <!-- Radar Header -->
      <rect x="${rBoxX}" y="${rBoxY}" width="${rBoxW}" height="36" rx="10" fill="#111d33"/>
      <circle cx="${rBoxX + 22}" cy="${rBoxY + 18}" r="5" fill="#22c55e"/>
      <text x="${rBoxX + 36}" y="${rBoxY + 23}" fill="#38bdf8" font-size="12" font-family="monospace" font-weight="bold">RADAR SATELIT • CLOSE-UP FRONT TEMPUR</text>
      <text x="${rBoxX + rBoxW - 15}" y="${rBoxY + 23}" fill="#64748b" font-size="11" font-family="monospace" text-anchor="end">ZOOM 3.4X</text>

      <!-- Radar Clipped Window -->
      <g clip-path="url(#radarClip)">
        <rect x="${rWinX}" y="${rWinY}" width="${rWinW}" height="${rWinH}" fill="#050811"/>
        
        <!-- Scaled Zoomed Map -->
        <g transform="${radarTransform}">
          ${pathsSvg}
          <line x1="${ax}" y1="${ay}" x2="${dx}" y2="${dy}" stroke="#ef4444" stroke-width="2" stroke-dasharray="3,2"/>
          <circle cx="${ax}" cy="${ay}" r="4" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="${dx}" cy="${dy}" r="6" fill="none" stroke="#ef4444" stroke-width="2"/>
          <circle cx="${dx}" cy="${dy}" r="2" fill="#ef4444"/>
        </g>

        <!-- Radar Sweep Rings -->
        <circle cx="${rCx}" cy="${rCy}" r="40" fill="none" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3,3"/>
        <circle cx="${rCx}" cy="${rCy}" r="80" fill="none" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3,3"/>
        <circle cx="${rCx}" cy="${rCy}" r="120" fill="none" stroke="#38bdf8" stroke-width="0.8" stroke-opacity="0.3"/>
        <line x1="${rCx}" y1="${rWinY}" x2="${rCx}" y2="${rWinY + rWinH}" stroke="#38bdf8" stroke-width="0.6" stroke-opacity="0.3"/>
        <line x1="${rWinX}" y1="${rCy}" x2="${rWinX + rWinW}" y2="${rCy}" stroke="#38bdf8" stroke-width="0.6" stroke-opacity="0.3"/>

        <!-- Tactical HUD overlays in Zoom -->
        <rect x="${rWinX + 8}" y="${rWinY + 8}" width="230" height="44" rx="4" fill="#070d18" fill-opacity="0.9" stroke="#1e293b" stroke-width="1"/>
        <text x="${rWinX + 16}" y="${rWinY + 24}" fill="#38bdf8" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">⚔️ PENYERANG: ${atkName}</text>
        <text x="${rWinX + 16}" y="${rWinY + 42}" fill="#ef4444" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">🎯 TARGET: ${defName}</text>
      </g>
    `;
  } else {
    // Standby radar when no active battle
    radarInsetSvg = `
      <rect x="${rBoxX}" y="${rBoxY}" width="${rBoxW}" height="${rBoxH}" rx="10" fill="#0b1220" stroke="#1e293b" stroke-width="1.5"/>
      <rect x="${rBoxX}" y="${rBoxY}" width="${rBoxW}" height="36" rx="10" fill="#111d33"/>
      <circle cx="${rBoxX + 22}" cy="${rBoxY + 18}" r="5" fill="#38bdf8"/>
      <text x="${rBoxX + 36}" y="${rBoxY + 23}" fill="#94a3b8" font-size="12" font-family="monospace" font-weight="bold">RADAR SATELIT • STANDBY</text>
      <text x="${rCx}" y="${rCy}" fill="#475569" font-size="14" font-family="Segoe UI, sans-serif" text-anchor="middle">Menunggu Target Pertempuran...</text>
    `;
  }

  // 4. Secondary Tactical Metrics (Center Bottom)
  const topFactions = [...state.factions]
    .filter(f => !f.eliminated && f.territoryCount > 0)
    .sort((a, b) => b.territoryCount - a.territoryCount);

  const topLeader = topFactions[0] || state.factions[0];
  const unifPct = (((N - state.activeFactionsCount) / N) * 100).toFixed(1);

  const secondaryBoxSvg = `
    <g transform="translate(530, 850)">
      <rect x="0" y="0" width="950" height="185" rx="10" fill="#0d1424" stroke="#1e293b" stroke-width="1.5"/>
      <text x="25" y="32" fill="#94a3b8" font-size="12" font-family="monospace" font-weight="bold">STATUS TERITORIAL NUSANTARA (507 DISTRIK)</text>
      
      <!-- Metric 1: Pemimpin Terbesar -->
      <g transform="translate(25, 48)">
        <rect x="0" y="0" width="280" height="115" rx="6" fill="#131c30" stroke="#1e293b" stroke-width="1"/>
        <text x="16" y="26" fill="#64748b" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">FAKSI WILAYAH TERLUAS</text>
        <text x="16" y="58" fill="#ffffff" font-size="17" font-family="Segoe UI, sans-serif" font-weight="bold">${escapeXml(topLeader.name.slice(0, 22))}</text>
        <text x="16" y="86" fill="#38bdf8" font-size="13" font-family="monospace">${topLeader.territoryCount} Wilayah (${((topLeader.territoryCount / N) * 100).toFixed(1)}%)</text>
      </g>

      <!-- Metric 2: Progress Unifikasi -->
      <g transform="translate(325, 48)">
        <rect x="0" y="0" width="280" height="115" rx="6" fill="#131c30" stroke="#1e293b" stroke-width="1"/>
        <text x="16" y="26" fill="#64748b" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">PROGRESS UNIFIKASI</text>
        <text x="16" y="60" fill="#22c55e" font-size="24" font-family="monospace" font-weight="bold">${unifPct}%</text>
        <text x="16" y="88" fill="#94a3b8" font-size="11.5" font-family="Segoe UI, sans-serif">${N - state.activeFactionsCount} dari ${N} distrik telah jatuh</text>
      </g>

      <!-- Metric 3: Catatan Intelijen -->
      <g transform="translate(625, 48)">
        <rect x="0" y="0" width="300" height="115" rx="6" fill="#131c30" stroke="#1e293b" stroke-width="1"/>
        <text x="16" y="26" fill="#64748b" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">STATUS OPERASI TERAKHIR</text>
        ${battle && battle.eliminated
          ? `<text x="16" y="58" fill="#f87171" font-size="13.5" font-family="Segoe UI, sans-serif" font-weight="bold">💀 ${escapeXml(battle.eliminated.name)} Tereliminasi</text>
             <text x="16" y="86" fill="#64748b" font-size="11.5" font-family="Segoe UI, sans-serif">Wilayah resmi dianeksasi pemenang</text>`
          : battle && battle.success
          ? `<text x="16" y="58" fill="#fbbf24" font-size="13.5" font-family="Segoe UI, sans-serif" font-weight="bold">💥 Penaklukan Wilayah</text>
             <text x="16" y="86" fill="#64748b" font-size="11.5" font-family="Segoe UI, sans-serif">Garis perbatasan berhasil ditembus</text>`
          : `<text x="16" y="58" fill="#4ade80" font-size="13.5" font-family="Segoe UI, sans-serif" font-weight="bold">🛡️ Pertahanan Sukses</text>
             <text x="16" y="86" fill="#64748b" font-size="11.5" font-family="Segoe UI, sans-serif">Garnisun bertahan memukul mundur musuh</text>`
        }
      </g>
    </g>
  `;

  // 5. Top 10 Leaderboard Rows
  let leaderboardRows = '';
  topFactions.slice(0, 10).forEach((f, idx) => {
    const y = 285 + idx * 49;
    const pct = ((f.territoryCount / N) * 100).toFixed(1);
    const rankNum = idx + 1;
    const rankColor = rankNum === 1 ? '#f59e0b' : rankNum === 2 ? '#94a3b8' : rankNum === 3 ? '#b45309' : '#475569';
    const rankBadge = rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : rankNum === 3 ? '🥉' : `#${rankNum}`;
    const nameStr = escapeXml(f.name.length > 20 ? f.name.slice(0, 19) + '…' : f.name);

    leaderboardRows += `
      <g transform="translate(1525, ${y})">
        <rect x="0" y="0" width="350" height="42" rx="6" fill="#131c2e" fill-opacity="0.8"/>
        <rect x="8" y="9" width="30" height="24" rx="4" fill="${rankColor}" fill-opacity="0.25"/>
        <text x="23" y="26" fill="${rankColor}" font-size="12" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="middle">${rankBadge}</text>
        <rect x="46" y="11" width="20" height="20" rx="4" fill="${f.color}" stroke="#ffffff" stroke-width="1"/>
        <text x="74" y="26" fill="#ffffff" font-size="13.5" font-family="Segoe UI, sans-serif" font-weight="600">${nameStr}</text>
        <text x="338" y="26" fill="#38bdf8" font-size="13.5" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="end">${f.territoryCount} <tspan fill="#64748b" font-size="11">(${pct}%)</tspan></text>
      </g>
    `;
  });

  // 6. Header & Battle Incident Content
  const roundNum = battle ? battle.round : state.round;
  const dateStr = battle ? battle.date : `${state.month}/${state.year}`;
  const activeCount = state.activeFactionsCount;
  const eliminatedCount = N - activeCount;

  let battleAlertSvg = '';
  if (state.gameOver && state.winner) {
    const winnerName = escapeXml(state.winner.name);
    battleAlertSvg = `
      <rect x="50" y="112" width="1410" height="56" rx="8" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
      <text x="80" y="146" fill="#86efac" font-size="19" font-family="Segoe UI, sans-serif" font-weight="900">👑 PEMENANG MUTLAK NUSANTARA!</text>
      <text x="380" y="146" fill="#ffffff" font-size="16" font-family="Segoe UI, sans-serif">
        <tspan font-weight="bold" fill="#facc15">${winnerName}</tspan> telah menaklukkan seluruh 507 kota &amp; kabupaten se-Indonesia!
      </text>
    `;
  } else if (battle) {
    const atkName = escapeXml(battle.atkFaction.name);
    const defTerrName = escapeXml(battle.defTerritory.name);
    const defFactionName = escapeXml(battle.defFaction.name);
    const rawCasus = battle.warReport ? battle.warReport.casusBelli : 'Sengketa batas wilayah perbatasan';
    const casusBelli = escapeXml(rawCasus.length > 105 ? rawCasus.slice(0, 102) + '…' : rawCasus);

    if (battle.success) {
      const elimText = battle.eliminated
        ? `<tspan fill="#fca5a5" font-weight="bold"> | 💀 ${escapeXml(battle.eliminated.name)} RUNTUH &amp; DIBUBARKAN!</tspan>`
        : '';
      battleAlertSvg = `
        <rect x="50" y="112" width="1410" height="56" rx="8" fill="url(#battleBox)" stroke="#ef4444" stroke-width="1.2"/>
        <text x="70" y="133" fill="#fca5a5" font-size="12.5" font-family="Segoe UI, sans-serif" font-weight="bold">📢 Pemicu Konflik: <tspan fill="#ffffff" font-weight="normal">${casusBelli}</tspan></text>
        <text x="70" y="154" fill="#ffffff" font-size="14.5" font-family="Segoe UI, sans-serif">
          ⚔️ <tspan font-weight="bold" fill="#38bdf8">${atkName}</tspan> menyerbu dan menaklukkan sektor <tspan font-weight="bold" fill="#f87171">${defTerrName}</tspan>!
          <tspan fill="#fbbf24" font-weight="bold"> [JATUH &amp; DIANEKSASI]</tspan>
          ${elimText}
        </text>
      `;
    } else {
      battleAlertSvg = `
        <rect x="50" y="112" width="1410" height="56" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.2"/>
        <text x="70" y="133" fill="#93c5fd" font-size="12.5" font-family="Segoe UI, sans-serif" font-weight="bold">📢 Pemicu Konflik: <tspan fill="#ffffff" font-weight="normal">${casusBelli}</tspan></text>
        <text x="70" y="154" fill="#ffffff" font-size="14.5" font-family="Segoe UI, sans-serif">
          🛡️ <tspan font-weight="bold" fill="#38bdf8">${atkName}</tspan> menyerbu sektor <tspan font-weight="bold" fill="#93c5fd">${defTerrName}</tspan>
          <tspan fill="#4ade80" font-weight="bold"> [SERANGAN GAGAL: DIPUKUL MUNDUR OLEH GARNISUN ${defFactionName}]</tspan>
        </text>
      `;
    }
  } else {
    battleAlertSvg = `
      <rect x="50" y="112" width="1410" height="56" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="80" y="146" fill="#94a3b8" font-size="16" font-family="Segoe UI, sans-serif">Menunggu ronde pertempuran dimulai...</text>
    `;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <!-- Ocean Background Gradient -->
    <radialGradient id="oceanGlow" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="#0e172a"/>
      <stop offset="100%" stop-color="#060913"/>
    </radialGradient>

    <!-- Radar Clip Path -->
    <clipPath id="radarClip">
      <rect x="${rWinX}" y="${rWinY}" width="${rWinW}" height="${rWinH}" rx="8"/>
    </clipPath>

    <linearGradient id="battleBox" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7f1d1d" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <!-- Deep Nautical Ocean Canvas -->
  <rect width="100%" height="100%" fill="url(#oceanGlow)"/>

  <!-- Maritime Lat/Lon Graticule -->
  ${gridSvg}

  <!-- Header Section Frame -->
  <rect x="30" y="25" width="1450" height="155" rx="10" fill="#0d1424" stroke="#1e293b" stroke-width="1.5"/>

  <!-- Tactical Corner Accents -->
  <path d="M35,37 L35,27 L45,27" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
  <path d="M1475,37 L1475,27 L1465,27" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
  <path d="M35,168 L35,178 L45,178" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
  <path d="M1475,168 L1475,178 L1465,178" fill="none" stroke="#38bdf8" stroke-width="2.5"/>

  <text x="60" y="66" fill="#ffffff" font-size="28" font-family="Segoe UI, sans-serif" font-weight="900" letter-spacing="1.5">INDONESIA WAR BOT</text>
  <text x="60" y="92" fill="#64748b" font-size="14" font-family="Segoe UI, sans-serif">KOMANDO OPERASI MILITER &amp; INTELIJEN TERITORIAL 507 DISTRIK</text>

  <!-- Top Badges -->
  <g transform="translate(1040, 42)">
    <rect x="0" y="0" width="130" height="40" rx="6" fill="#ef4444"/>
    <text x="65" y="25" fill="#ffffff" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle">RONDE ${roundNum}</text>
  </g>
  <g transform="translate(1185, 42)">
    <rect x="0" y="0" width="130" height="40" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="65" y="25" fill="#38bdf8" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle">DEFCON 1</text>
  </g>
  <g transform="translate(1330, 42)">
    <rect x="0" y="0" width="135" height="40" rx="6" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="67" y="25" fill="#22c55e" font-size="13" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="middle">${activeCount} FAKSI AKTIF</text>
  </g>

  <!-- Battle Alert Box -->
  ${battleAlertSvg}

  <!-- Main Map Layer -->
  <g id="main-map">
    ${pathsSvg}
  </g>

  <!-- Battle Trajectory Line on Main Map -->
  ${battleMarkerSvg}

  <!-- RADAR INSET PANEL (Left Bottom) -->
  ${radarInsetSvg}

  <!-- SECONDARY TACTICAL BOX (Center Bottom) -->
  ${secondaryBoxSvg}

  <!-- Leaderboard Panel (Right Sidebar) -->
  <rect x="1505" y="25" width="385" height="1030" rx="12" fill="#0a101d" stroke="#1e293b" stroke-width="1.5"/>
  <text x="1530" y="66" fill="#ffffff" font-size="20" font-family="Segoe UI, sans-serif" font-weight="bold">KLASEMEN SEMENTARA</text>
  <text x="1530" y="90" fill="#64748b" font-size="13" font-family="Segoe UI, sans-serif">Faksi Dengan Wilayah Terbanyak</text>

  <!-- Counter Summary Cards -->
  <g transform="translate(1525, 112)">
    <rect x="0" y="0" width="165" height="66" rx="8" fill="#111a2d" stroke="#1e2b45" stroke-width="1"/>
    <text x="18" y="26" fill="#64748b" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">SISA FAKSI</text>
    <text x="18" y="53" fill="#22c55e" font-size="24" font-family="Segoe UI, sans-serif" font-weight="bold">${activeCount}</text>
  </g>
  <g transform="translate(1705, 112)">
    <rect x="0" y="0" width="165" height="66" rx="8" fill="#111a2d" stroke="#1e2b45" stroke-width="1"/>
    <text x="18" y="26" fill="#64748b" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">TERELIMINASI</text>
    <text x="18" y="53" fill="#ef4444" font-size="24" font-family="Segoe UI, sans-serif" font-weight="bold">${eliminatedCount}</text>
  </g>

  <!-- Date Pill -->
  <rect x="1525" y="196" width="345" height="38" rx="6" fill="#162035"/>
  <text x="1697" y="220" fill="#94a3b8" font-size="13" font-family="Segoe UI, sans-serif" font-weight="600" text-anchor="middle">📅 ${dateStr} • Bulan Ke-${roundNum}</text>

  <!-- Leaderboard Header Column -->
  <text x="1535" y="268" fill="#475569" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">RANK</text>
  <text x="1865" y="268" fill="#475569" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="end">KONTROL</text>

  <!-- Leaderboard Rows -->
  ${leaderboardRows}

  <!-- Footer Watermark -->
  <text x="1697" y="1025" fill="#334155" font-size="12" font-family="Segoe UI, sans-serif" text-anchor="middle">Facebook Page: World War Bot Indonesia</text>
</svg>
`;
}

function renderMapPng(graph, state, battle) {
  const svg = renderMapSvg(graph, state, battle);
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: W }
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

module.exports = {
  renderMapSvg,
  renderMapPng
};
