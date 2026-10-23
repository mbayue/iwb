function slugify(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '');
}

function formatPostCaption(graph, state, battle) {
  const N = graph.totalTerritories;

  if (state.gameOver && state.winner) {
    const winnerName = state.winner.name;
    const winnerSlug = slugify(winnerName);
    return `🏆 PERANG NUSANTARA TELAH SELESAI! 🏆

Setelah ${state.round} bulan pertempuran sengit antar kota dan kabupaten se-Indonesia, satu faksi berhasil menaklukkan seluruh 507 wilayah!

👑 SANG JUARA MUTLAK:
⭐ ${winnerName.toUpperCase()} ⭐

Seluruh wilayah dari Sabang sampai Merauke kini resmi berada di bawah kekuasaan ${winnerName}!

📊 STATISTIK AKHIR:
• Total Ronde: ${state.round}
• Waktu Selesai: ${battle ? battle.date : `${state.month}/${state.year}`}
• Total Wilayah Ditaklukkan: 507 / 507 (100%)

Terima kasih telah mengikuti World War Bot Indonesia!
Tulis di kolom komentar kota favoritmu yang bertahan paling lama! 🔥

#WorldWarBotIndonesia #WorldWarBot #IndonesiaWarBot #${winnerSlug} #PemenangMutlak #NusantaraConquered`;
  }

  const {
    round, date, atkFaction, defFaction, atkTerritory, defTerritory,
    success, eliminated, activeFactionsCount, warReport
  } = battle;

  const atkName = atkFaction.name;
  const defName = defTerritory.name;
  const defOwnerName = defFaction.name;

  const opName = warReport ? warReport.operationName : 'Operasi Kilat Teritorial';
  const theater = warReport ? warReport.theater : 'Front Garis Depan Perbatasan';
  const story = warReport ? warReport.story : '';
  const intensity = warReport ? warReport.intensity : 'Pertempuran Sengit';
  const casualties = warReport ? warReport.casualties : 'Tinggi';

  const statusHeader = success
    ? (eliminated ? '🔥 [LAPORAN INTELIJEN: PENAKLUKAN TOTAL & ELIMINASI]' : '💥 [LAPORAN INTELIJEN: GARIS DEPAN JEBOL]')
    : '🛡️ [LAPORAN INTELIJEN: SERANGAN DIPUKUL MUNDUR]';

  const battleBulletin = `${statusHeader}
🎖️ Operasi Militer : "${opName}"
📍 Sektor Front     : ${theater}
⚔️ Faksi Penyerang : ${atkName}
🛡️ Faksi Bertahan  : ${defOwnerName} (Wilayah: ${defName})

📝 LAPORAN TEMPUR DARI GARIS DEPAN:
${story}

⚠️ Evaluasi Taktis:
• Intensitas Benturan : ${intensity}
• Estimasi Dampak     : ${casualties}`;
  // Top 5 factions
  const topFactions = [...state.factions]
    .filter(f => !f.eliminated && f.territoryCount > 0)
    .sort((a, b) => b.territoryCount - a.territoryCount)
    .slice(0, 5);

  const leader = topFactions[0] || atkFaction;
  const leaderPct = ((leader.territoryCount / N) * 100).toFixed(1);

  let leaderboardText = '🏆 5 BESAR WILAYAH TERLUAS:\n';
  topFactions.forEach((f, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
    leaderboardText += `${medal} ${idx + 1}. ${f.name} (${f.territoryCount} wilayah)\n`;
  });

  const atkSlug = slugify(atkName);
  const defSlug = slugify(defName);

  return `🚨 KAWAT BERITA PERANG NUSANTARA [Ronde ${round} - ${date}] 🚨

${battleBulletin}

📊 STATUS STRATEGIS NUSANTARA:
• Sisa Faksi Bertahan : ${activeFactionsCount} / ${N} faksi
• Faksi Terluas       : ${leader.name} (${leader.territoryCount} wilayah - ${leaderPct}%)

${leaderboardText.trim()}

💬 Siapa faksi/kota jagoanmu yang masih bertahan? Tulis di komentar! 👇

#WorldWarBot #WorldWarBotIndonesia #IndonesiaWarBot #WarBotIndonesia #${atkSlug} #${defSlug} #PerangNusantara`;
}

module.exports = {
  formatPostCaption
};
