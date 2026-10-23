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

  // 1. Territories Paths
  let pathsSvg = '';
  for (let i = 0; i < N; i++) {
    const ownerId = state.territoryOwner[i];
    const color = state.factions[ownerId].color;
    const isDef = battle && battle.defTerritory && i === battle.defTerritory.id;
    const isAtk = battle && battle.atkTerritory && i === battle.atkTerritory.id;

    const stroke = isDef ? '#ef4444' : isAtk ? '#38bdf8' : '#080c14';
    const strokeW = isDef ? '2.5' : isAtk ? '2.0' : '0.4';
    pathsSvg += `<path d="${graph.territories[i].pathD}" fill="${color}" stroke="${stroke}" stroke-width="${strokeW}" id="t_${i}"/>\n`;
  }

  // 2. Battle marker & trajectory
  let battleMarkerSvg = '';
  if (battle && battle.atkTerritory && battle.defTerritory) {
    const [ax, ay] = battle.atkTerritory.cScreen;
    const [dx, dy] = battle.defTerritory.cScreen;
    const defName = escapeXml(battle.defTerritory.name);
    const boxW = Math.max(140, defName.length * 8.5 + 45);
    const boxX = Math.min(dx + 16, 1420 - boxW);
    const boxY = Math.max(dy - 16, 210);

    battleMarkerSvg = `
      <!-- Attack line -->
      <line x1="${ax}" y1="${ay}" x2="${dx}" y2="${dy}" stroke="#ef4444" stroke-width="3" stroke-dasharray="6,4" stroke-linecap="round"/>
      <circle cx="${ax}" cy="${ay}" r="6" fill="#38bdf8" stroke="#ffffff" stroke-width="2"/>
      <circle cx="${dx}" cy="${dy}" r="11" fill="none" stroke="#ef4444" stroke-width="3"/>
      <circle cx="${dx}" cy="${dy}" r="4" fill="#ef4444"/>
      
      <!-- Target callout pill -->
      <g transform="translate(${boxX}, ${boxY})">
        <rect x="0" y="0" width="${boxW}" height="28" rx="6" fill="#0f172a" stroke="#ef4444" stroke-width="1.5" fill-opacity="0.95"/>
        <text x="10" y="19" fill="#ffffff" font-size="13" font-family="Segoe UI, sans-serif" font-weight="bold">🎯 ${defName}</text>
      </g>
    `;
  }

  // 3. Top 10 Leaderboard
  const topFactions = [...state.factions]
    .filter(f => !f.eliminated && f.territoryCount > 0)
    .sort((a, b) => b.territoryCount - a.territoryCount)
    .slice(0, 10);

  let leaderboardRows = '';
  topFactions.forEach((f, idx) => {
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

  // 4. Header & Battle Alert Content
  const roundNum = battle ? battle.round : state.round;
  const dateStr = battle ? battle.date : `${state.month}/${state.year}`;
  const activeCount = state.activeFactionsCount;
  const eliminatedCount = N - activeCount;

  let battleAlertSvg = '';
  if (state.gameOver && state.winner) {
    const winnerName = escapeXml(state.winner.name);
    battleAlertSvg = `
      <rect x="50" y="112" width="1410" height="54" rx="8" fill="#14532d" stroke="#22c55e" stroke-width="1.5"/>
      <text x="80" y="146" fill="#86efac" font-size="19" font-family="Segoe UI, sans-serif" font-weight="900">👑 PEMENANG MUTLAK!</text>
      <text x="320" y="146" fill="#ffffff" font-size="16" font-family="Segoe UI, sans-serif">
        <tspan font-weight="bold" fill="#facc15">${winnerName}</tspan> telah menaklukkan seluruh 507 kota &amp; kabupaten se-Indonesia!
      </text>
    `;
  } else if (battle) {
    const atkName = escapeXml(battle.atkFaction.name);
    const defTerrName = escapeXml(battle.defTerritory.name);
    const defFactionName = escapeXml(battle.defFaction.name);

    const rawCasus = battle.warReport ? battle.warReport.casusBelli : 'Sengketa batas wilayah antar-daerah';
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
      <rect x="50" y="112" width="1410" height="54" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
      <text x="80" y="146" fill="#94a3b8" font-size="16" font-family="Segoe UI, sans-serif">Menunggu ronde pertempuran dimulai...</text>
    `;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="topBg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="battleBox" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#881337" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0.8"/>
    </linearGradient>
  </defs>

  <!-- Deep space background -->
  <rect width="100%" height="100%" fill="#070a10"/>

  <!-- Top Header Frame -->
  <rect x="30" y="25" width="1450" height="155" rx="12" fill="url(#topBg)" stroke="#1e293b" stroke-width="1.5"/>

  <text x="60" y="66" fill="#ffffff" font-size="30" font-family="Segoe UI, sans-serif" font-weight="900" letter-spacing="1">WORLD WAR BOT INDONESIA</text>
  <text x="60" y="93" fill="#94a3b8" font-size="15" font-family="Segoe UI, sans-serif">Simulasi Perang 507 Kota &amp; Kabupaten Se-Nusantara</text>

  <!-- Round & Remaining Badges -->
  <g transform="translate(1120, 45)">
    <rect x="0" y="0" width="150" height="44" rx="8" fill="#dc2626"/>
    <text x="75" y="28" fill="#ffffff" font-size="16" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="middle">RONDE ${roundNum}</text>
  </g>
  <g transform="translate(1285, 45)">
    <rect x="0" y="0" width="170" height="44" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1"/>
    <text x="85" y="27" fill="#38bdf8" font-size="14" font-family="Segoe UI, sans-serif" font-weight="bold" text-anchor="middle">${activeCount} / ${N} FAKSI</text>
  </g>

  <!-- Battle Alert Box -->
  ${battleAlertSvg}

  <!-- Indonesian Map Polygons -->
  <g id="territory-map">
    ${pathsSvg}
  </g>

  <!-- Tactical Target Marker -->
  ${battleMarkerSvg}

  <!-- Sidebar Leaderboard & Stats -->
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
