const OPERATIONS = [
  'Operasi Badai Gurita', 'Gempuran Cakra Kirana', 'Operasi Rajawali Merah',
  'Operasi Mandau Terbang', 'Operasi Panah Rimba', 'Gempuran Naga Selatan',
  'Operasi Benteng Baja', 'Operasi Sabuk Nusantara', 'Operasi Petir Khatulistiwa',
  'Operasi Trisula Perkasa', 'Gempuran Bukit Barisan', 'Operasi Rawa Samudera',
  'Operasi Cakar Garuda', 'Gempuran Merapi Merangsek', 'Operasi Badai Pasundan',
  'Operasi Bintang Mahakam', 'Gempuran Lembah Suropati', 'Operasi Singa Barong',
  'Operasi Krakatau Gelap', 'Gempuran Seribu Ombak', 'Operasi Elang Khatulistiwa',
  'Operasi Sambar Samudera', 'Gempuran Benteng Mataram', 'Operasi Mandau Sakti'
];

const THEATERS_LAND = [
  'Garis Pertahanan Perbatasan Darat',
  'Sektor Lembah & Perbukitan Batas',
  'Koridor Hutan Belantara & Garis Parit',
  'Front Dataran Tinggi Strategis',
  'Garis Batas Sungai & Pos Jembatan',
  'Perlintasan Jalur Logistik Utama'
];

const THEATERS_WATER = [
  'Sektor Pesisir Pantai & Dermaga Strategis',
  'Perlintasan Selat Maritim Antar-Pulau',
  'Front Pangkalan Laut & Garis Pantai Terluar',
  'Garis Penyeberangan Armada Perintis'
];

const LAND_CONQUEST_STORIES = [
  'Setelah sepekan duel artileri berat melumpuhkan pos radar dan depo amunisi perbatasan, brigade garda depan {atk} melancarkan manuver sapu bersih. Garis parit {def} jebol dan pasukan pertahanan terpaksa mengibarkan bendera putih setelah pos komandonya diduduki.',
  'Konvoi lapis baja dan infanteri mekanis {atk} menerobos batas teritorial {def} dalam serangan kilat fajar. Pertahanan perimeter {def} kocar-kacir akibat serangan sayap tak terduga, memaksa kompi garnisun mundur tanpa sempat menyelamatkan persenjataan.',
  'Pasukan elit {atk} berhasil memutus seluruh jalur logistik vital dan jembatan penghubung utama ke {def}. Terisolasi tanpa amunisi cadangan, seluruh benteng pertahanan {def} akhirnya lumpuh dan menyatakan menyerah tanpa syarat.',
  'Pertempuran sengit berkecamuk di garis perbukitan perbatasan. Mengandalkan superioritas taktis dan gempuran mortir beruntun, batalyon penyerbu {atk} meruntuhkan barikade terakhir {def} dan mengibarkan benderanya di gedung administrasi kota.'
];

const WATER_CONQUEST_STORIES = [
  'Armada kapal pendarat {atk} berhasil menembus blokade laut di bawah lindungan tembakan artileri pesisir. Pasukan marinir sukses mengamankan dermaga logistik dan merebut seluruh garis pantai {def} setelah baku tembak sengit di dermaga.',
  'Operasi lintas selat mendadak pada tengah malam oleh divisi amfibi {atk} sukses melumpuhkan pos penjaga pantai {def}. Sebelum garnisun utama sempat merespons, seluruh pangkalan strategis {def} telah dikuasai sepenuhnya.',
  'Armada patroli tempur {atk} melancarkan serbuan cepat melintasi perairan perbatasan. Pasukan pendarat berhasil mengamankan perimeter pantai dan mendesak mundur pertahanan pesisir {def} ke pedalaman hingga menyerah.'
];

const LAND_DEFENSE_STORIES = [
  'Garnisun pertahanan {def} memanfaatkan keunggulan kontur medan terjal dan memasang perangkap parit ranjau. Gelombang invasi {atk} terjebak di bawah hujan tembakan senapan mesin dan terpaksa ditarik mundur dengan kerugian taktis besar.',
  'Serangan kilat {atk} menemui jalan buntu setelah membentur benteng beton dan barikade lapis baja {def}. Setelah baku tembak 72 jam tanpa kemajuan teritorial, komando front {atk} memerintahkan mundur teratur.',
  'Batalyon infanteri {def} melancarkan serangan balik taktis tepat di sayap kiri musuh. Konvoi penyerbu {atk} tercerai-berai di perbatasan hutan dan garis penyerangan berhasil dipukul mundur ke garis awal.',
  'Pertahanan garis batas {def} tetap kokoh tak tergoyahkan meski dihujani tembakan mortir tanpa henti. Pasukan penyerbu {atk} gagal mendirikan pos terdepan dan terpaksa membubarkan formasinya.'
];

const WATER_DEFENSE_STORIES = [
  'Upaya penyeberangan armada kapal pendarat {atk} digagalkan oleh baterai meriam pesisir dan kapal patroli cepat {def} sebelum sempat merapat ke pantai. Armada penyerbu terpaksa memutar haluan.',
  'Pasukan penjaga pantai {def} mendeteksi pergerakan amfibi {atk} di tengah kabut fajar. Dengan tembakan artileri pantai terkoordinasi, seluruh gelombang pendaratan musuh berhasil dipukul mundur ke tengah laut.'
];

const ELIMINATION_STORIES = [
  'Ibukota {def} telah jatuh seutuhnya ke tangan musuh. Komandan tertinggi garnisun menandatangani dokumen kapitulasi total. Faksi {def} resmi RUNTUH dan wilayahnya dianeksasi penuh!',
  'Seluruh pangkalan militer dan pusat pemerintahan {def} kini berada di bawah kendali penuh {atk}. Faksi {def} resmi DINYATAKAN GUGUR dan dihapus dari peta kekuasaan Nusantara!',
  'Garis pertahanan terakhir {def} hancur lebur tanpa sisa. Seluruh persenjataan disita dan panji kebesaran {atk} kini berkibar di atas seluruh wilayah bekas kekuasaan {def}.'
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateWarReport(atkName, defName, isStrait, success, eliminated) {
  const operationName = pickRandom(OPERATIONS);
  const theater = isStrait ? pickRandom(THEATERS_WATER) : pickRandom(THEATERS_LAND);

  let storyTemplate = '';
  let shortOutcome = '';
  let bannerText = '';

  if (success) {
    storyTemplate = isStrait ? pickRandom(WATER_CONQUEST_STORIES) : pickRandom(LAND_CONQUEST_STORIES);
    const story = storyTemplate.replace(/{atk}/g, atkName).replace(/{def}/g, defName);

    if (eliminated) {
      const elimStory = pickRandom(ELIMINATION_STORIES).replace(/{atk}/g, atkName).replace(/{def}/g, defName);
      shortOutcome = `JATUH & DIANEKSASI | 💀 ${defName} Runtuh`;
      bannerText = `⚔️ ${operationName.toUpperCase()}: ${atkName} menjebol pertahanan ${defName}! 💀 ${defName} RUNTUH & DIANEKSASI!`;

      return {
        operationName,
        theater,
        story: `${story}\n\n💀 STATUS AKHIR:\n${elimStory}`,
        shortOutcome,
        bannerText,
        casualties: 'Sangat Parah (Garnisun Runtuh)',
        intensity: 'Pertempuran Skala Penuh'
      };
    } else {
      shortOutcome = `JATUH & DIANEKSASI (Garis pertahanan jebol)`;
      bannerText = `⚔️ ${operationName.toUpperCase()}: ${atkName} berhasil menaklukkan sektor ${defName}!`;

      return {
        operationName,
        theater,
        story,
        shortOutcome,
        bannerText,
        casualties: 'Tinggi (Wilayah Berpindah Tangan)',
        intensity: 'Penyerbuan Garis Depan'
      };
    }
  } else {
    storyTemplate = isStrait ? pickRandom(WATER_DEFENSE_STORIES) : pickRandom(LAND_DEFENSE_STORIES);
    const story = storyTemplate.replace(/{atk}/g, atkName).replace(/{def}/g, defName);
    shortOutcome = `GAGAL DITEMBUS (Serangan dipukul mundur)`;
    bannerText = `🛡️ ${operationName.toUpperCase()}: ${defName} berhasil menghalau gempuran ${atkName}!`;

    return {
      operationName,
      theater,
      story,
      shortOutcome,
      bannerText,
      casualties: 'Sedang (Serangan Digagalkan)',
      intensity: 'Baku Tembak Perbatasan'
    };
  }
}

module.exports = {
  generateWarReport
};
