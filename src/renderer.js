const { Resvg } = require('@resvg/resvg-js');
const config = require('./config');

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

function getThemeTokens(themeName = 'light') {
  const isLight = themeName === 'light';
  if (isLight) {
    return {
      isLight: true,
      oceanDef: `
        <linearGradient id="oceanGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#e0f2fe"/>
          <stop offset="50%" stop-color="#edf8ff"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
      `,
      oceanFill: 'url(#oceanGlow)',
      graticuleEq: '#94a3b8',
      graticuleLine: '#cbd5e1',
      graticuleText: '#64748b',
      territoryStroke: '#ffffff',
      territoryStrokeW: '0.8',
      cardFill: '#ffffff',
      cardBorder: '#cbd5e1',
      titleColor: '#0f172a',
      subTitleColor: '#64748b',
      badgeStatusFill: '#f1f5f9',
      badgeStatusBorder: '#cbd5e1',
      badgeStatusText: '#0369a1',
      badgeActiveText: '#15803d',
      radarBoxFill: '#ffffff',
      radarBoxBorder: '#cbd5e1',
      radarHeaderFill: '#f8fafc',
      radarHeaderText: '#0369a1',
      radarWinFill: '#e0f2fe',
      radarSweep: '#0284c7',
      subCardFill: '#f8fafc',
      subCardBorder: '#e2e8f0',
      metricTitleColor: '#64748b',
      metricValueColor: '#0f172a',
      sidebarFill: '#ffffff',
      sidebarBorder: '#cbd5e1',
      datePillFill: '#f1f5f9',
      datePillBorder: '#e2e8f0',
      datePillText: '#475569',
      rowFill: '#f8fafc',
      rowBorder: '#e2e8f0',
      rowText: '#0f172a',
      rowSubText: '#0284c7',
      watermarkColor: '#94a3b8',
      battleBoxDef: `
        <linearGradient id="battleBox" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#fee2e2"/>
          <stop offset="100%" stop-color="#fef3c7"/>
        </linearGradient>
      `,
      battleBoxBorder: '#f87171',
      casusLabelColor: '#991b1b',
      casusTextColor: '#1e293b',
      atkColor: '#0284c7',
      defColor: '#dc2626',
      successBadgeColor: '#b45309'
    };
  } else {
    return {
      isLight: false,
      oceanDef: `
        <radialGradient id="oceanGlow" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#0e172a"/>
          <stop offset="100%" stop-color="#060913"/>
        </radialGradient>
      `,
      oceanFill: 'url(#oceanGlow)',
      graticuleEq: '#334155',
      graticuleLine: '#172235',
      graticuleText: '#475569',
      territoryStroke: '#080d16',
      territoryStrokeW: '0.6',
      cardFill: '#0d1424',
      cardBorder: '#1e293b',
      titleColor: '#ffffff',
      subTitleColor: '#64748b',
      badgeStatusFill: '#1e293b',
      badgeStatusBorder: '#334155',
      badgeStatusText: '#38bdf8',
      badgeActiveText: '#22c55e',
      radarBoxFill: '#0b1220',
      radarBoxBorder: '#38bdf8',
      radarHeaderFill: '#111d33',
      radarHeaderText: '#38bdf8',
      radarWinFill: '#050811',
      radarSweep: '#38bdf8',
      subCardFill: '#131c30',
      subCardBorder: '#1e293b',
      metricTitleColor: '#64748b',
      metricValueColor: '#ffffff',
      sidebarFill: '#0a101d',
      sidebarBorder: '#1e293b',
      datePillFill: '#162035',
      datePillBorder: '#1e293b',
      datePillText: '#94a3b8',
      rowFill: '#131c2e',
      rowBorder: '#1e293b',
      rowText: '#ffffff',
      rowSubText: '#38bdf8',
      watermarkColor: '#334155',
      battleBoxDef: `
        <linearGradient id="battleBox" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#7f1d1d" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0.9"/>
        </linearGradient>
      `,
      battleBoxBorder: '#ef4444',
      casusLabelColor: '#fca5a5',
      casusTextColor: '#ffffff',
      atkColor: '#38bdf8',
      defColor: '#f87171',
      successBadgeColor: '#fbbf24'
    };
  }
}

function renderMapSvg(graph, state, battle, overrideTheme = null) {
  const themeName = overrideTheme || config.MAP_THEME || 'light';
  const T = getThemeTokens(themeName);
  const N = graph.totalTerritories;
  const { mapX, mapY, mapW, mapH, scale, minLon, maxLat } = graph.projection;

  // 1. Graticule Lines
  let gridSvg = '';
  [-10, -5, 0, 5].forEach(lat => {
    const y = mapY + (maxLat - lat) * scale;
    const label = lat === 0 ? '0° KHATULISTIWA' : lat < 0 ? `${Math.abs(lat)}°S` : `${lat}°N`;
    const isEq = lat === 0;
    gridSvg += `
      <line x1="${mapX}" y1="${y}" x2="${mapX + mapW}" y2="${y}" stroke="${isEq ? T.graticuleEq : T.graticuleLine}" stroke-width="${isEq ? 1.2 : 0.8}" stroke-dasharray="${isEq ? '6,6' : '3,6'}"/>
      <text x="${mapX + mapW - 10}" y="${y - 5}" fill="${T.graticuleText}" font-size="10" font-family="monospace" text-anchor="end">${label}</text>
    `;
  });

  [100, 110, 120, 130, 140].forEach(lon => {
    const x = mapX + (lon - minLon) * scale;
    gridSvg += `
      <line x1="${x}" y1="${mapY}" x2="${x}" y2="${mapY + mapH}" stroke="${T.graticuleLine}" stroke-width="0.8" stroke-dasharray="3,6"/>
      <text x="${x + 5}" y="${mapY + 18}" fill="${T.graticuleText}" font-size="10" font-family="monospace">${lon}°E</text>
    `;
  });

  // 2. Territories Paths
  let pathsSvg = '';
  for (let i = 0; i < N; i++) {
    const ownerId = state.territoryOwner[i];
    const color = state.factions[ownerId].color;
    const isDef = battle && battle.defTerritory && i === battle.defTerritory.id;
    const isAtk = battle && battle.atkTerritory && i === battle.atkTerritory.id;

    const stroke = isDef ? T.defColor : isAtk ? T.atkColor : T.territoryStroke;
    const strokeW = isDef ? '2.5' : isAtk ? '2.0' : T.territoryStrokeW;
    pathsSvg += `<path d="${graph.territories[i].pathD}" fill="${color}" stroke="${stroke}" stroke-width="${strokeW}" id="t_${i}"/>\n`;
  }

  // 3. Battle Indicators on Main Map & Radar Inset
  let battleMarkerSvg = '';
  let radarInsetSvg = '';

  // Bottom layout baseline: y: 715, height: 330 (ends at 1045)
  const rBoxX = 40, rBoxY = 715, rBoxW = 480, rBoxH = 330;
  const rWinX = rBoxX + 15, rWinY = rBoxY + 45, rWinW = rBoxW - 30, rWinH = 215;
  const rCx = rWinX + rWinW / 2;
  const rCy = rWinY + rWinH / 2;

  if (battle && battle.atkTerritory && battle.defTerritory) {
    const [ax, ay] = battle.atkTerritory.cScreen;
    const [dx, dy] = battle.defTerritory.cScreen;
    const defName = escapeXml(battle.defTerritory.name);
    const atkName = escapeXml(battle.atkFaction.name);

    battleMarkerSvg = `
      <line x1="${ax}" y1="${ay}" x2="${dx}" y2="${dy}" stroke="${T.defColor}" stroke-width="2.5" stroke-dasharray="5,4"/>
      <circle cx="${ax}" cy="${ay}" r="5" fill="${T.atkColor}" stroke="#ffffff" stroke-width="1.5"/>
      <circle cx="${dx}" cy="${dy}" r="9" fill="none" stroke="${T.defColor}" stroke-width="2.5"/>
      <circle cx="${dx}" cy="${dy}" r="3" fill="${T.defColor}"/>
    `;

    // Radar Inset
    const tCx = (ax + dx) / 2;
    const tCy = (ay + dy) / 2;
    const zoom = 3.4;
    const radarTransform = `translate(${rCx}, ${rCy}) scale(${zoom}) translate(-${tCx}, -${tCy})`;

    radarInsetSvg = `
      <!-- RADAR INSET PANEL (Left Bottom) -->
      <rect x="${rBoxX}" y="${rBoxY}" width="${rBoxW}" height="${rBoxH}" rx="10" fill="${T.radarBoxFill}" stroke="${T.radarBoxBorder}" stroke-width="1.5"/>
      
      <!-- Radar Header -->
      <rect x="${rBoxX}" y="${rBoxY}" width="${rBoxW}" height="36" rx="10" fill="${T.radarHeaderFill}"/>
      <text x="${rBoxX + 18}" y="${rBoxY + 23}" fill="${T.radarHeaderText}" font-size="12" font-family="monospace" font-weight="bold">PANTAUAN SATELIT • FOKUS MEDAN TEMPUR</text>
      <text x="${rBoxX + rBoxW - 18}" y="${rBoxY + 23}" fill="${T.textSecondary}" font-size="11" font-family="monospace" text-anchor="end">ZOOM 3.4X</text>

      <!-- Radar Clipped Window (Clean & Unobstructed) -->
      <g clip-path="url(#radarClip)">
        <rect x="${rWinX}" y="${rWinY}" width="${rWinW}" height="${rWinH}" rx="6" fill="${T.radarWinFill}"/>
        
        <!-- Scaled Zoomed Map -->
        <g transform="${radarTransform}">
          ${pathsSvg}
          <line x1="${ax}" y1="${ay}" x2="${dx}" y2="${dy}" stroke="${T.defColor}" stroke-width="2" stroke-dasharray="3,2"/>
          <circle cx="${ax}" cy="${ay}" r="4" fill="${T.atkColor}" stroke="#ffffff" stroke-width="1.5"/>
          <circle cx="${dx}" cy="${dy}" r="6" fill="none" stroke="${T.defColor}" stroke-width="2"/>
          <circle cx="${dx}" cy="${dy}" r="2" fill="${T.defColor}"/>
        </g>

        <!-- Distance Range Rings -->
        <circle cx="${rCx}" cy="${rCy}" r="35" fill="none" stroke="${T.radarSweep}" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3,3"/>
        <circle cx="${rCx}" cy="${rCy}" r="75" fill="none" stroke="${T.radarSweep}" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3,3"/>
        <circle cx="${rCx}" cy="${rCy}" r="115" fill="none" stroke="${T.radarSweep}" stroke-width="0.8" stroke-opacity="0.25"/>
        <line x1="${rCx}" y1="${rWinY}" x2="${rCx}" y2="${rWinY + rWinH}" stroke="${T.radarSweep}" stroke-width="0.6" stroke-opacity="0.25"/>
        <line x1="${rWinX}" y1="${rCy}" x2="${rWinX + rWinW}" y2="${rCy}" stroke="${T.radarSweep}" stroke-width="0.6" stroke-opacity="0.25"/>
      </g>

      <!-- Dedicated Bottom Sub-bar (Unobstructed View) -->
      <g transform="translate(${rWinX}, ${rBoxY + 270})">
        <rect x="0" y="0" width="${rWinW}" height="48" rx="6" fill="${T.subCardFill}" stroke="${T.subCardBorder}" stroke-width="1"/>
        
        <text x="14" y="20" fill="${T.atkColor}" font-size="10.5" font-family="Segoe UI, sans-serif" font-weight="bold">PENYERANG</text>
        <text x="14" y="38" fill="${T.titleColor}" font-size="13" font-family="Segoe UI, sans-serif" font-weight="600">${atkName.slice(0, 18)}</text>
        
        <text x="${rWinW / 2 + 10}" y="20" fill="${T.defColor}" font-size="10.5" font-family="Segoe UI, sans-serif" font-weight="bold">SASARAN</text>
        <text x="${rWinW / 2 + 10}" y="38" fill="${T.titleColor}" font-size="13" font-family="Segoe UI, sans-serif" font-weight="600">${defName.slice(0, 18)}</text>
      </g>
    `;
  } else {
    radarInsetSvg = `
      <rect x="${rBoxX}" y="${rBoxY}" width="${rBoxW}" height="${rBoxH}" rx="10" fill="${T.radarBoxFill}" stroke="${T.cardBorder}" stroke-width="1.5"/>
      <rect x="${rBoxX}" y="${rBoxY}" width="${rBoxW}" height="36" rx="10" fill="${T.radarHeaderFill}"/>
      <text x="${rBoxX + 18}" y="${rBoxY + 23}" fill="${T.textSecondary}" font-size="12" font-family="monospace" font-weight="bold">PANTAUAN SATELIT • STANDBY</text>
      <text x="${rCx}" y="${rCy}" fill="${T.textSecondary}" font-size="14" font-family="Segoe UI, sans-serif" text-anchor="middle">Menunggu Target Pertempuran...</text>
    `;
  }

  // 4. Secondary Tactical Box (Center Bottom, y: 715, height: 330, width: 935)
  const topFactions = [...state.factions]
    .filter(f => !f.eliminated && f.territoryCount > 0)
    .sort((a, b) => b.territoryCount - a.territoryCount);

  const topLeader = topFactions[0] || state.factions[0];
  const unifPct = (((N - state.activeFactionsCount) / N) * 100).toFixed(1);

  // Recent 3 battles feed
  const historyItems = (state.history && state.history.length > 0)
    ? state.history.slice(0, 3)
    : [];

  let historyCardsSvg = '';
  if (historyItems.length > 0) {
    historyItems.forEach((h, idx) => {
      const hx = 20 + idx * 300;
      const resBadge = h.elim
        ? { text: 'ELIMINASI', fill: T.defColor, sub: `Runtuh: ${escapeXml(h.elim)}` }
        : h.success
        ? { text: 'AN EKSASI', fill: T.successBadgeColor, sub: 'Wilayah Ditaklukkan' }
        : { text: 'DIHALAU', fill: '#16a34a', sub: 'Pertahanan Berhasil' };

      historyCardsSvg += `
        <g transform="translate(${hx}, 0)">
          <rect x="0" y="0" width="285" height="78" rx="6" fill="${T.subCardFill}" stroke="${T.subCardBorder}" stroke-width="1"/>
          <text x="12" y="22" fill="${T.textSecondary}" font-size="11" font-family="monospace">Ronde ${h.round} • ${h.date}</text>
          <rect x="205" y="10" width="68" height="18" rx="3" fill="${resBadge.fill}" fill-opacity="${T.isLight ? '0.15' : '0.25'}"/>
          <text x="239" y="23" fill="${resBadge.fill}" font-size="9.5" font-family="monospace" font-weight="bold" text-anchor="middle">${resBadge.text}</text>
          <text x="12" y="46" fill="${T.titleColor}" font-size="12.5" font-family="Segoe UI, sans-serif" font-weight="bold">${escapeXml(h.atk)} vs ${escapeXml(h.def)}</text>
          <text x="12" y="64" fill="${T.textSecondary}" font-size="11" font-family="Segoe UI, sans-serif">${resBadge.sub}</text>
        </g>
      `;
    });
  } else {
    historyCardsSvg = `
      <rect x="20" y="0" width="885" height="78" rx="6" fill="${T.subCardFill}" stroke="${T.subCardBorder}" stroke-width="1"/>
      <text x="460" y="45" fill="${T.textSecondary}" font-size="13" font-family="Segoe UI, sans-serif" text-anchor="middle">Belum ada catatan perang sebelumnya (Ronde Perdana).</text>
    `;
  }

  const secondaryBoxSvg = `
    <g transform="translate(540, 715)">
      <rect x="0" y="0" width="935" height="330" rx="10" fill="${T.cardFill}" stroke="${T.cardBorder}" stroke-width="1.5"/>
      <text x="25" y="32" fill="${T.textSecondary}" font-size="12" font-family="monospace" font-weight="bold">STATUS TERITORIAL NUSANTARA (507 KOTA &amp; KABUPATEN)</text>
      
      <!-- Top Deck: 3 Primary Metrics -->
      <g transform="translate(20, 50)">
        <!-- Metric 1 -->
        <g transform="translate(0, 0)">
          <rect x="0" y="0" width="285" height="110" rx="6" fill="${T.subCardFill}" stroke="${T.subCardBorder}" stroke-width="1"/>
          <text x="16" y="26" fill="${T.metricTitleColor}" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">FAKSI WILAYAH TERLUAS</text>
          <text x="16" y="56" fill="${T.metricValueColor}" font-size="17" font-family="Segoe UI, sans-serif" font-weight="bold">${escapeXml(topLeader.name.slice(0, 20))}</text>
          <text x="16" y="84" fill="${T.atkColor}" font-size="13" font-family="monospace">${topLeader.territoryCount} Wilayah (${((topLeader.territoryCount / N) * 100).toFixed(1)}%)</text>
        </g>

        <!-- Metric 2 -->
        <g transform="translate(300, 0)">
          <rect x="0" y="0" width="285" height="110" rx="6" fill="${T.subCardFill}" stroke="${T.subCardBorder}" stroke-width="1"/>
          <text x="16" y="26" fill="${T.metricTitleColor}" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">PROGRESS UNIFIKASI</text>
          <text x="16" y="58" fill="#16a34a" font-size="24" font-family="monospace" font-weight="bold">${unifPct}%</text>
          <text x="16" y="84" fill="${T.textSecondary}" font-size="11.5" font-family="Segoe UI, sans-serif">${N - state.activeFactionsCount} dari ${N} distrik telah jatuh</text>
        </g>

        <!-- Metric 3 -->
        <g transform="translate(600, 0)">
          <rect x="0" y="0" width="285" height="110" rx="6" fill="${T.subCardFill}" stroke="${T.subCardBorder}" stroke-width="1"/>
          <text x="16" y="26" fill="${T.metricTitleColor}" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">STATUS OPERASI TERAKHIR</text>
          ${battle && battle.eliminated
            ? `<text x="16" y="56" fill="${T.defColor}" font-size="13.5" font-family="Segoe UI, sans-serif" font-weight="bold">${escapeXml(battle.eliminated.name)} Tereliminasi</text>
               <text x="16" y="84" fill="${T.textSecondary}" font-size="11.5" font-family="Segoe UI, sans-serif">Wilayah resmi dianeksasi pemenang</text>`
            : battle && battle.success
            ? `<text x="16" y="56" fill="${T.successBadgeColor}" font-size="13.5" font-family="Segoe UI, sans-serif" font-weight="bold">Penaklukan Wilayah</text>
               <text x="16" y="84" fill="${T.textSecondary}" font-size="11.5" font-family="Segoe UI, sans-serif">Garis perbatasan berhasil ditembus</text>`
            : `<text x="16" y="56" fill="#16a34a" font-size="13.5" font-family="Segoe UI, sans-serif" font-weight="bold">Pertahanan Sukses</text>
               <text x="16" y="84" fill="${T.textSecondary}" font-size="11.5" font-family="Segoe UI, sans-serif">Garnisun berhasil memukul mundur musuh</text>`
          }
        </g>
      </g>

      <!-- Bottom Deck: Recent Battles Feed -->
      <g transform="translate(0, 185)">
        <text x="25" y="22" fill="${T.textSecondary}" font-size="11" font-family="monospace" font-weight="bold">RIWAYAT 3 PERTEMPURAN TERAKHIR</text>
        <g transform="translate(0, 36)">
          ${historyCardsSvg}
        </g>
      </g>
    </g>
  `;

  // 5. Right Sidebar (x: 1495, y: 25, w: 395, h: 1020)
  // Calculate distribution tiers
  let imperialCount = 0, expansionCount = 0, independentCount = 0;
  state.factions.forEach(f => {
    if (f.eliminated || f.territoryCount === 0) return;
    if (f.territoryCount >= 5) imperialCount++;
    else if (f.territoryCount >= 2) expansionCount++;
    else independentCount++;
  });
  const eliminatedCount = N - state.activeFactionsCount;

  // Render Top 9 factions in table
  let leaderboardRows = '';
  topFactions.slice(0, 9).forEach((f, idx) => {
    const y = 280 + idx * 43;
    const pct = ((f.territoryCount / N) * 100).toFixed(1);
    const rankNum = idx + 1;
    const rankColor = rankNum === 1 ? '#d97706' : rankNum === 2 ? '#64748b' : rankNum === 3 ? '#b45309' : '#64748b';
    const rankBadge = `#${rankNum}`;
    const nameStr = escapeXml(f.name.length > 20 ? f.name.slice(0, 19) + '…' : f.name);

    leaderboardRows += `
      <g transform="translate(1515, ${y})">
        <rect x="0" y="0" width="355" height="38" rx="6" fill="${T.rowFill}" stroke="${T.rowBorder}" stroke-width="1"/>
        <rect x="8" y="8" width="30" height="22" rx="4" fill="${rankColor}" fill-opacity="${T.isLight ? '0.15' : '0.25'}"/>
        <text x="23" y="23" fill="${rankColor}" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="middle">${rankBadge}</text>
        <rect x="46" y="9" width="20" height="20" rx="4" fill="${f.color}" stroke="${T.isLight ? '#94a3b8' : '#ffffff'}" stroke-width="1"/>
        <text x="74" y="24" fill="${T.rowText}" font-size="13" font-family="Segoe UI, sans-serif" font-weight="600">${nameStr}</text>
        <text x="345" y="24" fill="${T.rowSubText}" font-size="13" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="end">${f.territoryCount} <tspan fill="${T.textSecondary}" font-size="10.5">(${pct}%)</tspan></text>
      </g>
    `;
  });

  // Sidebar Bottom Demographics Box (Fills previous 250px dead space!)
  const distroCardSvg = `
    <g transform="translate(1515, 680)">
      <rect x="0" y="0" width="355" height="295" rx="8" fill="${T.subCardFill}" stroke="${T.subCardBorder}" stroke-width="1"/>
      <text x="16" y="26" fill="${T.metricTitleColor}" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">SEBARAN KEKUATAN NUSANTARA</text>
      
      <!-- Tier 1 -->
      <g transform="translate(16, 44)">
        <text x="0" y="14" fill="${T.titleColor}" font-size="12" font-family="Segoe UI, sans-serif">Kekaisaran (&gt;5 Wilayah)</text>
        <text x="323" y="14" fill="${T.titleColor}" font-size="12" font-family="monospace" font-weight="bold" text-anchor="end">${imperialCount} Faksi</text>
        <rect x="0" y="22" width="323" height="6" rx="3" fill="${T.isLight ? '#e2e8f0' : '#1e293b'}"/>
        <rect x="0" y="22" width="${Math.max(4, (imperialCount / N) * 323)}" height="6" rx="3" fill="#8b5cf6"/>
      </g>

      <!-- Tier 2 -->
      <g transform="translate(16, 96)">
        <text x="0" y="14" fill="${T.titleColor}" font-size="12" font-family="Segoe UI, sans-serif">Ekspansi (2-4 Wilayah)</text>
        <text x="323" y="14" fill="${T.titleColor}" font-size="12" font-family="monospace" font-weight="bold" text-anchor="end">${expansionCount} Faksi</text>
        <rect x="0" y="22" width="323" height="6" rx="3" fill="${T.isLight ? '#e2e8f0' : '#1e293b'}"/>
        <rect x="0" y="22" width="${Math.max(4, (expansionCount / N) * 323)}" height="6" rx="3" fill="${T.atkColor}"/>
      </g>

      <!-- Tier 3 -->
      <g transform="translate(16, 148)">
        <text x="0" y="14" fill="${T.titleColor}" font-size="12" font-family="Segoe UI, sans-serif">Independen (1 Wilayah)</text>
        <text x="323" y="14" fill="${T.titleColor}" font-size="12" font-family="monospace" font-weight="bold" text-anchor="end">${independentCount} Faksi</text>
        <rect x="0" y="22" width="323" height="6" rx="3" fill="${T.isLight ? '#e2e8f0' : '#1e293b'}"/>
        <rect x="0" y="22" width="${Math.max(4, (independentCount / N) * 323)}" height="6" rx="3" fill="#16a34a"/>
      </g>

      <!-- Tier 4 -->
      <g transform="translate(16, 200)">
        <text x="0" y="14" fill="${T.titleColor}" font-size="12" font-family="Segoe UI, sans-serif">Gugur / Runtuh (0 Wilayah)</text>
        <text x="323" y="14" fill="${T.titleColor}" font-size="12" font-family="monospace" font-weight="bold" text-anchor="end">${eliminatedCount} Faksi</text>
        <rect x="0" y="22" width="323" height="6" rx="3" fill="${T.isLight ? '#e2e8f0' : '#1e293b'}"/>
        <rect x="0" y="22" width="${Math.max(4, (eliminatedCount / N) * 323)}" height="6" rx="3" fill="${T.defColor}"/>
      </g>

      <!-- Footer Info inside Box -->
      <text x="162" y="274" fill="${T.textSecondary}" font-size="11" font-family="Segoe UI, sans-serif" text-anchor="middle">Total Inventaris: 507 Distrik Otonom</text>
    </g>
  `;

  // 6. Header Section Frame (x: 30, y: 25, w: 1445, h: 155)
  const roundNum = battle ? battle.round : state.round;
  const dateStr = battle ? battle.date : `${state.month}/${state.year}`;
  const activeCount = state.activeFactionsCount;

  let battleAlertSvg = '';
  if (state.gameOver && state.winner) {
    const winnerName = escapeXml(state.winner.name);
    battleAlertSvg = `
      <rect x="50" y="112" width="1405" height="56" rx="8" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
      <text x="80" y="146" fill="#86efac" font-size="19" font-family="Segoe UI, sans-serif" font-weight="900">PEMENANG MUTLAK NUSANTARA</text>
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
        ? `<tspan fill="${T.defColor}" font-weight="bold"> | ${escapeXml(battle.eliminated.name)} RUNTUH &amp; DIBUBARKAN</tspan>`
        : '';
      battleAlertSvg = `
        <rect x="50" y="112" width="1405" height="56" rx="8" fill="url(#battleBox)" stroke="${T.battleBoxBorder}" stroke-width="1.2"/>
        <text x="70" y="133" fill="${T.casusLabelColor}" font-size="12" font-family="Segoe UI, sans-serif" font-weight="bold">Pemicu Konflik: <tspan fill="${T.casusTextColor}" font-weight="normal">${casusBelli}</tspan></text>
        <text x="70" y="154" fill="${T.titleColor}" font-size="14.5" font-family="Segoe UI, sans-serif">
          <tspan font-weight="bold" fill="${T.atkColor}">${atkName}</tspan> menaklukkan sektor pertahanan <tspan font-weight="bold" fill="${T.defColor}">${defTerrName}</tspan>
          <tspan fill="${T.successBadgeColor}" font-weight="bold"> [JATUH &amp; DIANEKSASI]</tspan>
          ${elimText}
        </text>
      `;
    } else {
      battleAlertSvg = `
        <rect x="50" y="112" width="1405" height="56" rx="8" fill="${T.cardFill}" stroke="${T.cardBorder}" stroke-width="1.2"/>
        <text x="70" y="133" fill="${T.atkColor}" font-size="12" font-family="Segoe UI, sans-serif" font-weight="bold">Pemicu Konflik: <tspan fill="${T.casusTextColor}" font-weight="normal">${casusBelli}</tspan></text>
        <text x="70" y="154" fill="${T.titleColor}" font-size="14.5" font-family="Segoe UI, sans-serif">
          <tspan font-weight="bold" fill="${T.atkColor}">${atkName}</tspan> menyerbu sektor <tspan font-weight="bold" fill="${T.defColor}">${defTerrName}</tspan>
          <tspan fill="#16a34a" font-weight="bold"> [SERANGAN GAGAL: DIPUKUL MUNDUR OLEH GARNISUN ${defFactionName}]</tspan>
        </text>
      `;
    }
  } else {
    battleAlertSvg = `
      <rect x="50" y="112" width="1405" height="56" rx="8" fill="${T.cardFill}" stroke="${T.cardBorder}" stroke-width="1"/>
      <text x="80" y="146" fill="${T.textSecondary}" font-size="16" font-family="Segoe UI, sans-serif">Menunggu ronde pertempuran dimulai...</text>
    `;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${T.oceanDef}
    ${T.battleBoxDef}
    <clipPath id="radarClip">
      <rect x="${rWinX}" y="${rWinY}" width="${rWinW}" height="${rWinH}" rx="6"/>
    </clipPath>
  </defs>

  <!-- Ocean Background Canvas -->
  <rect width="100%" height="100%" fill="${T.oceanFill}"/>

  <!-- Maritime Lat/Lon Graticule -->
  ${gridSvg}

  <!-- Header Section Frame -->
  <rect x="30" y="25" width="1445" height="155" rx="10" fill="${T.cardFill}" stroke="${T.cardBorder}" stroke-width="1.5"/>

  <text x="60" y="66" fill="${T.titleColor}" font-size="28" font-family="Segoe UI, sans-serif" font-weight="900" letter-spacing="1.5">INDONESIA WAR BOT</text>
  <text x="60" y="92" fill="${T.subTitleColor}" font-size="14" font-family="Segoe UI, sans-serif">SIMULASI PERANG 507 KOTA &amp; KABUPATEN SE-NUSANTARA</text>

  <!-- Top Badges -->
  <g transform="translate(1040, 42)">
    <rect x="0" y="0" width="130" height="40" rx="6" fill="#dc2626"/>
    <text x="65" y="25" fill="#ffffff" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle">RONDE ${roundNum}</text>
  </g>
  <g transform="translate(1185, 42)">
    <rect x="0" y="0" width="130" height="40" rx="6" fill="${T.badgeStatusFill}" stroke="${T.badgeStatusBorder}" stroke-width="1"/>
    <text x="65" y="25" fill="${T.badgeStatusText}" font-size="14" font-family="monospace" font-weight="bold" text-anchor="middle">SIAGA 1</text>
  </g>
  <g transform="translate(1330, 42)">
    <rect x="0" y="0" width="135" height="40" rx="6" fill="${T.badgeStatusFill}" stroke="${T.badgeStatusBorder}" stroke-width="1"/>
    <text x="67" y="25" fill="${T.badgeActiveText}" font-size="13" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="middle">${activeCount} FAKSI AKTIF</text>
  </g>

  <!-- Battle Alert Box -->
  ${battleAlertSvg}

  <!-- Main Map Layer -->
  <g id="main-map">
    ${pathsSvg}
  </g>

  <!-- Battle Markers on Main Map -->
  ${battleMarkerSvg}

  <!-- RADAR INSET PANEL (Left Bottom) -->
  ${radarInsetSvg}

  <!-- SECONDARY TACTICAL BOX (Center Bottom) -->
  ${secondaryBoxSvg}

  <!-- Leaderboard Panel (Right Sidebar) -->
  <rect x="1495" y="25" width="395" height="1020" rx="12" fill="${T.sidebarFill}" stroke="${T.sidebarBorder}" stroke-width="1.5"/>
  <text x="1520" y="66" fill="${T.titleColor}" font-size="20" font-family="Segoe UI, sans-serif" font-weight="bold">KLASEMEN SEMENTARA</text>
  <text x="1520" y="90" fill="${T.textSecondary}" font-size="13" font-family="Segoe UI, sans-serif">Faksi Dengan Wilayah Terbanyak</text>

  <!-- Counter Summary Cards -->
  <g transform="translate(1515, 112)">
    <rect x="0" y="0" width="170" height="66" rx="8" fill="${T.subCardFill}" stroke="${T.subCardBorder}" stroke-width="1"/>
    <text x="18" y="26" fill="${T.metricTitleColor}" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">SISA FAKSI</text>
    <text x="18" y="53" fill="#16a34a" font-size="24" font-family="monospace" font-weight="bold">${activeCount}</text>
  </g>
  <g transform="translate(1700, 112)">
    <rect x="0" y="0" width="170" height="66" rx="8" fill="${T.subCardFill}" stroke="${T.subCardBorder}" stroke-width="1"/>
    <text x="18" y="26" fill="${T.metricTitleColor}" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">TERELIMINASI</text>
    <text x="18" y="53" fill="#dc2626" font-size="24" font-family="monospace" font-weight="bold">${eliminatedCount}</text>
  </g>

  <!-- Date Pill -->
  <rect x="1515" y="196" width="355" height="38" rx="6" fill="${T.datePillFill}" stroke="${T.datePillBorder}" stroke-width="1"/>
  <text x="1692" y="220" fill="${T.datePillText}" font-size="13" font-family="Segoe UI, sans-serif" font-weight="600" text-anchor="middle">${dateStr} • Bulan Ke-${roundNum}</text>

  <!-- Leaderboard Header Column -->
  <text x="1525" y="268" fill="${T.textSecondary}" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold">RANK</text>
  <text x="1860" y="268" fill="${T.textSecondary}" font-size="11" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="end">KONTROL</text>

  <!-- Leaderboard Rows -->
  ${leaderboardRows}

  <!-- Demographics Breakdown (Fills bottom sidebar space) -->
  ${distroCardSvg}
</svg>
`;
}

function renderMapPng(graph, state, battle, overrideTheme = null) {
  const svg = renderMapSvg(graph, state, battle, overrideTheme);
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
