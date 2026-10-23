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

  const { round, date, atkFaction, defFaction, atkTerritory, defTerritory, success, eliminated, activeFactionsCount } = battle;

  const atkName = atkFaction.name;
  const defName = defTerritory.name;
  const defOwnerName = defFaction.name;

  let battleDetails = '';
  if (success) {
    battleDetails = `⚔️ PERTEMPURAN TERJADI!
${atkName} melancarkan serangan terhadap ${defName}!

Hasil Pertempuran:
💥 ${defName} BERHASIL DITAKLUKKAN oleh ${atkName}!`;

    if (eliminated) {
      battleDetails += `\n\n💀 ${eliminated.name.toUpperCase()} TELAH TERELIMINASI!
Wilayah kekuasaan ${eliminated.name} kini resmi diambil alih oleh ${atkName}.`;
    }
  } else {
    battleDetails = `⚔️ PERTEMPURAN TERJADI!
${atkName} melancarkan serangan terhadap ${defName}!

Hasil Pertempuran:
🛡️ Serangan berhasil DIHALAU! ${defOwnerName} sukses mempertahankan wilayah ${defName}!`;
  }

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

  return `[Ronde ${round} - ${date}]

${battleDetails}

📊 STATISTIK SEMENTARA:
• Sisa Faksi Bertahan: ${activeFactionsCount} / ${N} faksi
• Pemimpin Wilayah: ${leader.name} (${leader.territoryCount} wilayah - ${leaderPct}%)

${leaderboardText.trim()}

Siapa kota jagoanmu yang masih bertahan? Tulis di komentar! 👇

#WorldWarBot #WorldWarBotIndonesia #IndonesiaWarBot #WarBotIndonesia #${atkSlug} #${defSlug} #PerangKota`;
}

module.exports = {
  formatPostCaption
};
