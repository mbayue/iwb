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

#WorldWarBotIndonesia #WorldWarBot #IndonesiaWarBot #${winnerSlug} #PemenangMutlak #NusantaraConquered`;
  }

  const {
    round, date, atkFaction, defFaction, atkTerritory, defTerritory,
    success, eliminated, activeFactionsCount, warReport
  } = battle;

  const atkName = atkFaction.name;
  const defName = defTerritory.name;
  const defOwnerName = defFaction.name;

  const casusBelli = warReport ? warReport.casusBelli : 'Sengketa perbatasan wilayah.';
  const story = warReport ? warReport.story : '';
  const impact = warReport ? warReport.impact : 'Wilayah Berpindah Tangan';

  let battleResult = '';
  if (success) {
    if (eliminated) {
      battleResult = `Hasil akhir:
Wilayah ${defName} resmi ditaklukkan dan dianeksasi oleh ${atkName}! Faksi ${eliminated.name} dinyatakan runtuh dan dibubarkan.`;
    } else {
      battleResult = `Hasil akhir:
Wilayah ${defName} berhasil direbut dan kini berada di bawah kendali ${atkName}.`;
    }
  } else {
    battleResult = `Hasil akhir:
Serangan gagal! Garnisun ${defOwnerName} berhasil memukul mundur agresi ${atkName} dari wilayah ${defName}.`;
  }

  const battleBulletin = `${atkName} melancarkan agresi militer ke wilayah ${defName} (${defOwnerName})!
Pemicu konflik: ${casusBelli}

Kronologi lapangan:
${story}

${battleResult}`;
  const topFactions = [...state.factions]
    .filter(f => !f.eliminated && f.territoryCount > 0)
    .sort((a, b) => b.territoryCount - a.territoryCount)
    .slice(0, 5);

  const leader = topFactions[0] || atkFaction;
  const leaderPct = ((leader.territoryCount / N) * 100).toFixed(1);

  let leaderboardText = 'Klasemen 5 Besar:\n';
  topFactions.forEach((f, idx) => {
    leaderboardText += `${idx + 1}. ${f.name} (${f.territoryCount} wilayah)\n`;
  });
  const atkSlug = slugify(atkName);
  const defSlug = slugify(defName);

  let prologue = '';
  if (round === 1) {
    prologue = `[Proklamasi Nusantara 2029]
Ramalan "Indonesia Bubar 2029" resmi terwujud. Pemerintahan pusat kolaps, dan seluruh 507 kota & kabupaten serentak memerdekakan diri karena kecewa pada kebijakan pusat. Perang perebutan supremasi tahta Nusantara resmi dimulai!

`;
  }

  return `${prologue}[Warta Perang Nusantara: Ronde ${round} — ${date}]

${battleBulletin}

Situasi Teritorial:
• Sisa faksi bertahan : ${activeFactionsCount} dari ${N} kota/kabupaten
• Faksi terluas       : ${leader.name} (${leader.territoryCount} wilayah — ${leaderPct}%)

${leaderboardText.trim()}

#WorldWarBot #WorldWarBotIndonesia #WarBotIndonesia #${atkSlug} #${defSlug}`;
}

module.exports = {
  formatPostCaption
};
