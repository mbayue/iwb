const fs = require('fs');
const path = require('path');
const { loadGraph } = require('./src/graph');
const { loadState, resetState, runBattleTurn, getTopFactions, saveState } = require('./src/simulation');
const { renderMapPng } = require('./src/renderer');
const { formatPostCaption } = require('./src/postFormatter');
const { publishTurn } = require('./src/facebook');
const config = require('./src/config');

async function handleTurn(forceDry = false) {
  const graph = loadGraph();
  const state = loadState(graph);

  if (state.gameOver) {
    console.log(`Perang telah selesai! Pemenang: ${state.winner ? state.winner.name : 'Unknown'}.`);
    console.log('Jalankan "npm run reset" untuk memulai perang baru.');
    return;
  }

  console.log(`Menjalankan Ronde #${state.round + 1}...`);
  const battle = runBattleTurn(graph, state);

  console.log(`Rendering peta pertempuran 1920x1080 (Ronde ${battle.round})...`);
  const imageBuffer = renderMapPng(graph, state, battle);

  console.log('Memformat narasi caption Facebook...');
  const caption = formatPostCaption(graph, state, battle);

  const result = await publishTurn(imageBuffer, caption, battle.round, forceDry);
  return result;
}

async function handleAuto(intervalSeconds) {
  const interval = (intervalSeconds || config.DEFAULT_INTERVAL_SECONDS) * 1000;
  console.log(`Mode Otomatis aktif. Ronde akan diposting setiap ${interval / 1000} detik (${(interval / 60000).toFixed(1)} menit).`);
  console.log('Tekan Ctrl+C untuk menghentikan.\n');

  const execute = async () => {
    try {
      await handleTurn(false);
    } catch (err) {
      console.error('Error saat menjalankan ronde otomatis:', err);
    }
  };

  // Run immediate first turn
  await execute();

  // Schedule interval
  setInterval(execute, interval);
}

function handleStatus() {
  const graph = loadGraph();
  const state = loadState(graph);

  console.log('\n========================================');
  console.log('      STATUS WORLD WAR BOT INDONESIA    ');
  console.log('========================================');
  console.log(`Ronde Saat Ini    : ${state.round}`);
  console.log(`Waktu Simulasi    : Bulan ${state.month}, Tahun ${state.year}`);
  console.log(`Faksi Aktif       : ${state.activeFactionsCount} / ${graph.totalTerritories}`);
  console.log(`Faksi Tereliminasi: ${graph.totalTerritories - state.activeFactionsCount}`);
  console.log(`Status Perang     : ${state.gameOver ? 'SELESAI (Ada Juara!)' : 'BERLANGSUNG'}`);
  if (state.winner) {
    console.log(`Juara Mutlak      : 👑 ${state.winner.name}`);
  }

  const top10 = getTopFactions(state, 10);
  console.log('\n--- TOP 10 KLASEMEN SEMENTARA ---');
  top10.forEach((f, idx) => {
    const pct = ((f.territoryCount / graph.totalTerritories) * 100).toFixed(1);
    console.log(`  #${idx + 1}. ${f.name.padEnd(25)} : ${f.territoryCount} wilayah (${pct}%)`);
  });

  if (state.history && state.history.length > 0) {
    console.log('\n--- 5 PERTEMPURAN TERAKHIR ---');
    state.history.slice(0, 5).forEach(h => {
      const op = h.operationName ? `[${h.operationName}] ` : '';
      const outcome = h.shortOutcome || (h.success ? 'JATUH & DIANEKSASI' : 'GAGAL DITEMBUS');
      console.log(`  [Ronde ${h.round} - ${h.date}] ${op}${h.atk} vs ${h.def}`);
      console.log(`    ↳ Status: ${outcome}`);
    });
  }
  console.log('========================================\n');
}

function handleReset() {
  const graph = loadGraph();
  const fresh = resetState(graph);
  console.log(`Status perang berhasil di-reset ke Ronde 0.`);
  console.log(`Seluruh ${fresh.activeFactionsCount} kota & kabupaten kembali independen.`);
}

function handlePreview() {
  const graph = loadGraph();
  const state = loadState(graph);
  console.log(`Membuat preview peta terkini (Ronde ${state.round})...`);
  const imageBuffer = renderMapPng(graph, state, state.lastBattle);
  const previewPath = path.join(process.cwd(), 'preview.png');
  fs.writeFileSync(previewPath, imageBuffer);
  console.log(`Preview disimpan di: ${previewPath}`);
}

function handleSimulate(count) {
  const N = parseInt(count || '10', 10);
  const graph = loadGraph();
  const state = loadState(graph);

  console.log(`Melakukan simulasi cepat sebanyak ${N} ronde tanpa posting...`);
  for (let i = 0; i < N; i++) {
    if (state.gameOver) {
      console.log(`Perang berakhir pada ronde ${state.round}! Pemenang: ${state.winner.name}`);
      break;
    }
    const battle = runBattleTurn(graph, state);
    const op = battle.warReport ? `[${battle.warReport.operationName}] ` : '';
    const outcome = battle.warReport ? battle.warReport.shortOutcome : (battle.success ? 'JATUH & DIANEKSASI' : 'GAGAL DITEMBUS');
    console.log(`[Ronde ${battle.round} - ${battle.date}] ${op}${battle.atkFaction.name} -> ${battle.defTerritory.name}`);
    console.log(`  ↳ ${outcome}`);
  }
  console.log(`\nSimulasi selesai. Faksi tersisa: ${state.activeFactionsCount} / ${graph.totalTerritories}.`);
  console.log('Jalankan "npm run preview" untuk melihat peta hasil simulasi.');
}

async function main() {
  const command = process.argv[2] || 'turn';
  const arg = process.argv[3];

  switch (command) {
    case 'turn':
      await handleTurn(false);
      break;
    case 'dry':
    case 'dryrun':
    case 'turn:dry':
      await handleTurn(true);
      break;
    case 'auto':
      await handleAuto(arg ? parseInt(arg, 10) : undefined);
      break;
    case 'status':
      handleStatus();
      break;
    case 'reset':
      handleReset();
      break;
    case 'preview':
      handlePreview();
      break;
    case 'sim':
    case 'simulate':
      handleSimulate(arg);
      break;
    default:
      console.log(`
Penggunaan World War Bot Indonesia:
  node index.js turn        - Jalankan 1 ronde dan upload ke Facebook (atau simpan di output/ jika token kosong)
  node index.js dry         - Jalankan 1 ronde dalam mode dry-run (hanya simpan file lokal)
  node index.js auto [detik]- Jalankan otomatis setiap X detik (default: 3600 detik / 1 jam)
  node index.js status      - Tampilkan klasemen dan statistik terkini
  node index.js preview     - Render peta kondisi saat ini ke preview.png
  node index.js reset       - Reset perang kembali ke kondisi awal (semua 507 kota merdeka)
  node index.js sim [N]     - Simulasikan N ronde sekaligus tanpa upload
      `);
  }
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
