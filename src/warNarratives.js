// Generator Alasan Perang & Narasi Satir Kondisi Indonesia Terkini

const GENERAL_CASUS_BELLI = [
  'Rebutan kuota program Makan Bergizi Gratis (MBG) yang jatah susunya tertukar dengan susu kedelai basi.',
  'Bupati tersinggung karena anggaran perbaikan jalan dialihkan buat sewa mobil dinas paman.',
  'Konflik pecah akibat parade Sound Horeg 100.000 watt yang merontokkan genteng warga perbatasan.',
  'Warga lokal geram mobil plat B bikin macet total di jalur wisata tiap akhir pekan.',
  'Preman ormas berseragam loreng oranye saling klaim jatah parkir Indomaret di tugu perbatasan.',
  'Sengketa hak paten martabak manis vs terang bulan dan soto mana yang paling otentik se-Nusantara.',
  'Pasukan penyerbu marah besar kena potongan Tapera dan rencana PPN naik 12%, lalu melampiaskannya ke kota sebelah.',
  'Server pertahanan perbatasan lumpuh total gara-gara password admin diganti jadi "Admin#1234".',
  'Sengketa pembagian beras bansos yang turns out isinya karung pasir dan mie instan kadaluarsa.',
  'Kabel fiber optic WiFi perbatasan putus tersangkut truk kontainer ODOL (Over Dimension Over Load).',
  'Dinas PUPR kota sebelah salah pasang plang batas wilayah sejauh 5 kilometer ke arah sawah warga.',
  'Debt collector pinjol salah sita motor dinas milik komandan satpol PP perbatasan.',
  'Saling sindir di grup WhatsApp RT antar-kabupaten berujung pengerahan massa bermotor knalpot brong.',
  'Rebutan sumber mata air mineral galon dan sengketa hak kelola kelapa muda di bukit perbatasan.',
  'Konflik jatah rokok tanpa cukai dan razia knalpot brong ilegal di warung remang-remang perbatasan.',
  'Bupati merasa tidak dihargai karena fotonya di baliho selamat datang perbatasan dipasang miring.',
  'Sengketa jalur zonasi PPDB sekolah favorit yang membuat anak bupati terlempar ke sekolah swasta.',
  'Komandan pos perbatasan kalah judi online (judol) lalu mengerahkan anak buahnya merampas kas kota tetangga.'
];

const STRAIT_CASUS_BELLI = [
  'Antrean tiket kapal feri ASDP macet horor 24 jam di dermaga pelabuhan penyeberangan.',
  'Kapal nelayan dituduh melanggar batas zona tangkap cumi-cumi dan kepiting bakau tanpa izin.',
  'Pungli karcis masuk pulau wisata pantai pasir putih naik 5 kali lipat secara sepihak.',
  'Sengketa kepemilikan karang pulau tak berpenghuni yang ternyata kaya tambang pasir laut.'
];

const CONQUEST_STORIES = [
  'Pasukan elit {atk} melancarkan infiltrasi senyap lewat jalur tikus sambil membunyikan sound horeg. Pertahanan {def} kocar-kacir setelah kaca pos penjagaan retak bergetar dan garnisun lokal memilih nobar ketimbang bertempur.',
  'Konvoi pick-up dan motor brong {atk} menerobos gerbang batas teritorial {def} saat subuh. Pasukan pertahanan {def} tertidur pulas akibat begadang nonton bola, sehingga kantor pemda berhasil diduduki tanpa perlawanan berarti.',
  'Laskar {atk} memblokade pasar induk dan menyita seluruh pasokan cabai rawit ke {def}. Tanpa stok sambal dan amunisi cadangan, garnisun {def} lumpuh total dan menyatakan menyerah sukarela.',
  'Mengandalkan serbuan kilat di jalur bypass, divisi komando {atk} sukses merebut tugu perbatasan dan gedung dinas {def}. Bendera {def} diturunkan dan diganti bendera kejayaan {atk}.'
];

const STRAIT_CONQUEST_STORIES = [
  'Armada kapal pendarat {atk} menyamar sebagai rombongan ziarah wali sanga dan sukses merapat di pelabuhan {def}. Sebelum satpol PP sadar, seluruh dermaga dan pos karcis telah diambil alih.',
  'Pasukan marinir {atk} menerobos selat di tengah kabut fajar. Dengan bantuan nelayan lokal yang diberi sembako gratis, seluruh pangkalan pantai {def} berhasil diamankan.'
];

const DEFENSE_STORIES = [
  'Pasukan penyerbu {atk} gagal masuk karena terjebak macet horor dan jalan rusak berlubang yang belum diaspal sejak zaman Daendels.',
  'Konvoi tempur {atk} dipukul mundur secara memalukan oleh barisan emak-emak naik motor matic sein kiri tapi belok kanan.',
  'Serangan mendadak {atk} gagal total setelah dihadang ormas setempat yang meminta "uang koordinasi wilayah" sebesar Rp50.000 per tank tempur.',
  'Tank penyerbu {atk} kehabisan bensin eceran di tengah jalan dan tentaranya malah nongkrong ngopi dan makan gorengan di warkop perbatasan.',
  'Pasukan {atk} tersesat di tengah perkebunan sawit karena supir konvoi mengikuti arahan Google Maps rute jalan setapak.',
  'Pertahanan {def} sukses mengusir musuh berkat tembakan basoka Sound Horeg 80.000 watt yang bikin telinga pasukan penyerbu berdenging 3 hari 3 malam.',
  'Serangan {atk} terpaksa ditarik mundur setelah seluruh kompi terkena diare massal akibat jajan cilok berformalin di pos batas.'
];

const STRAIT_DEFENSE_STORIES = [
  'Kapal penyerbu {atk} terdampar di karang dangkal akibat nakhoda sibuk live TikTok, memudahkan penjaga pantai {def} mengusir mereka dengan mercon.',
  'Upaya pendaratan laut {atk} digagalkan oleh ombak pasang dan hadangan calo tiket kapal penyeberangan {def} yang memaksa bayar tunai.'
];

const ELIMINATION_STORIES = [
  'Bupati dan seluruh pejabat {def} resmi kabur ke luar negeri dengan modus dinas studi banding. Kantor Pemda {def} resmi disita dan diubah jadi gerai Mie Gacoan cabang {atk}!',
  'Faksi {def} resmi BUBAR! Seluruh warga {def} kini wajib ganti KTP, bayar retribusi ke dinasti {atk}, dan dilarang membanggakan kuliner asalnya.',
  'Kantor bupati {def} dilelang di balai lelang negara, APBD dialihkan buat traktir makan siang warga {atk}, dan nama {def} resmi DIHAPUS DARI PETA NUSANTARA!',
  'Setelah kalah total, seluruh aparatur sipil {def} menyatakan resign massal. Wilayah {def} kini resmi turun derajat menjadi kecamatan bawahan {atk}!'
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getCasusBelli(atkName, defName, isStrait) {
  const combined = `${atkName} ${defName}`.toLowerCase();

  // Regional Easter Eggs & Lore
  if (combined.includes('jakarta') && combined.includes('bekasi')) {
    return 'Bekasi membalas dendam setelah bertahun-tahun diejek sebagai planet berbeda di galaksi lain.';
  }
  if (combined.includes('jakarta') && combined.includes('bogor')) {
    return 'Warga Jakarta menyerbu Bogor demi mencari udara segar setelah Jakarta darurat polusi udara.';
  }
  if (combined.includes('depok')) {
    return 'Warga Depok mendeklarasikan aneksasi wilayah setelah seekor babi ngepet kabur melintasi batas kota.';
  }
  if (combined.includes('bandung') && (combined.includes('garut') || combined.includes('tasikmalaya') || combined.includes('jakarta'))) {
    return 'Warga Bandung murka mobil plat B bikin macet total di Dago tiap libur akhir pekan.';
  }
  if (combined.includes('surabaya') && (combined.includes('bangkalan') || combined.includes('madura') || combined.includes('sampang'))) {
    return 'Sengketa tarif tol Suramadu dan perebutan jatah parkir gudang besi tua di pesisir.';
  }
  if (combined.includes('malang') && combined.includes('surabaya')) {
    return 'Rivalitas abadi supporter sepak bola merembet ke sengketa batas teritorial jalur kereta api.';
  }
  if ((combined.includes('yogyakarta') || combined.includes('sleman') || combined.includes('bantul')) && (combined.includes('surakarta') || combined.includes('solo') || combined.includes('klaten'))) {
    return 'Perang gengsi memperebutkan resep Gudeg paling otentik dan debat sengit UMR 2 juta rupiah.';
  }
  if (combined.includes('pati') && (combined.includes('kudus') || combined.includes('jepara') || combined.includes('rembang'))) {
    return 'Pati memerdekakan diri dan menyerang tetangga akibat sengketa perizinan festival Sound Horeg nonstop 24 jam.';
  }
  if (combined.includes('lampung')) {
    return 'Sengketa jalan provinsi yang berlubang parah tapi di laporan pertanggungjawaban diklaim mulus beraspal.';
  }
  if (combined.includes('medan') || combined.includes('deli')) {
    return 'Preman simpang menolak bayar uang koordinasi ke pos perbatasan, memicu perang terbuka antar-lorong.';
  }
  if (combined.includes('bali') || combined.includes('banyuwangi') || combined.includes('jembrana')) {
    return 'Antrean kapal feri Ketapang-Gilimanuk macet 18 jam gara-gara sistem tiket online servernya down.';
  }

  if (isStrait) {
    return pickRandom(STRAIT_CASUS_BELLI);
  }
  return pickRandom(GENERAL_CASUS_BELLI);
}

function generateWarReport(atkName, defName, isStrait, success, eliminated) {
  const casusBelli = getCasusBelli(atkName, defName, isStrait);

  let story = '';
  let shortOutcome = '';
  let bannerText = '';

  if (success) {
    const baseStory = isStrait ? pickRandom(STRAIT_CONQUEST_STORIES) : pickRandom(CONQUEST_STORIES);
    story = baseStory.replace(/{atk}/g, atkName).replace(/{def}/g, defName);

    if (eliminated) {
      const elimStory = pickRandom(ELIMINATION_STORIES).replace(/{atk}/g, atkName).replace(/{def}/g, defName);
      shortOutcome = `JATUH & DIANEKSASI | 💀 ${defName} Runtuh & Lenyap dari Peta`;
      bannerText = `⚔️ [PEMICU: ${casusBelli.slice(0, 38)}...] ${atkName} menjebol ${defName}! 💀 ${defName} RUNTUH!`;

      return {
        casusBelli,
        story: `${story}\n\n💀 NASIB AKHIR:\n${elimStory}`,
        shortOutcome,
        bannerText,
        impact: 'Kekalahan Total (Bupati Kabur)',
        atmosphere: 'Dikuasai Penuh'
      };
    } else {
      shortOutcome = `JATUH & DIANEKSASI (Pos batas & pemda diduduki)`;
      bannerText = `⚔️ [PEMICU: ${casusBelli.slice(0, 38)}...] ${atkName} berhasil menaklukkan sektor ${defName}!`;

      return {
        casusBelli,
        story,
        shortOutcome,
        bannerText,
        impact: 'Wilayah Berpindah Tangan',
        atmosphere: 'Penyerbuan Berhasil'
      };
    }
  } else {
    const baseStory = isStrait ? pickRandom(STRAIT_DEFENSE_STORIES) : pickRandom(DEFENSE_STORIES);
    story = baseStory.replace(/{atk}/g, atkName).replace(/{def}/g, defName);
    shortOutcome = `SERANGAN GAGAL (Dipukul mundur / terjebak jalan rusak)`;
    bannerText = `🛡️ [PEMICU: ${casusBelli.slice(0, 38)}...] ${defName} sukses menghalau serbuan ${atkName}!`;

    return {
      casusBelli,
      story,
      shortOutcome,
      bannerText,
      impact: 'Kerugian Logistik Penyerbu',
      atmosphere: 'Garnisun Sukses Bertahan'
    };
  }
}

module.exports = {
  generateWarReport,
  getCasusBelli
};
