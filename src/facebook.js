const fs = require('fs');
const path = require('path');
const config = require('./config');

async function publishTurn(imageBuffer, captionText, roundNumber, forceDryRun = false) {
  // Ensure output directory exists
  fs.mkdirSync(config.PATHS.OUTPUT, { recursive: true });

  const paddedRound = String(roundNumber).padStart(5, '0');
  const imageFileName = `round_${paddedRound}.png`;
  const textFileName = `round_${paddedRound}.txt`;

  const imagePath = path.join(config.PATHS.OUTPUT, imageFileName);
  const textPath = path.join(config.PATHS.OUTPUT, textFileName);

  // Always save a local copy to output/ with lock-safe write
  try {
    fs.writeFileSync(imagePath, imageBuffer);
  } catch (err) {
    const fallbackPath = path.join(config.PATHS.OUTPUT, `round_${paddedRound}_${Date.now()}.png`);
    fs.writeFileSync(fallbackPath, imageBuffer);
    console.warn(`Peringatan: ${imagePath} sedang dibuka aplikasi lain, disimpan ke ${fallbackPath}`);
  }
  try {
    fs.writeFileSync(textPath, captionText, 'utf8');
  } catch {
    // silent fallback
  }

  const hasCredentials = Boolean(config.FB_PAGE_ID && config.FB_PAGE_ACCESS_TOKEN);

  if (forceDryRun || !hasCredentials) {
    console.log('\n[DRY RUN MODE]');
    if (!hasCredentials) {
      console.log('Catatan: FB_PAGE_ID atau FB_PAGE_ACCESS_TOKEN belum diisi di .env.');
    }
    console.log(`Gambar berhasil disimpan: ${imagePath}`);
    console.log(`Caption berhasil disimpan: ${textPath}`);
    console.log('\n--- PREVIEW CAPTION FACEBOOK ---');
    console.log(captionText);
    console.log('--------------------------------\n');

    return {
      success: true,
      mode: 'dry-run',
      imagePath,
      textPath
    };
  }

  // Live Facebook Graph API Upload
  console.log(`Mengunggah ronde #${roundNumber} ke Facebook Page (${config.FB_PAGE_ID})...`);

  const url = `https://graph.facebook.com/${config.FB_GRAPH_VERSION}/${config.FB_PAGE_ID}/photos`;

  const formData = new FormData();
  formData.append('access_token', config.FB_PAGE_ACCESS_TOKEN);
  formData.append('caption', captionText);
  formData.append('published', 'true');
  formData.append(
    'source',
    new Blob([imageBuffer], { type: 'image/png' }),
    imageFileName
  );

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      const errMessage = data.error ? data.error.message : res.statusText;
      console.error('Facebook Graph API Error:', data.error || data);
      throw new Error(`Gagal posting ke Facebook: ${errMessage}`);
    }

    const postId = data.post_id || data.id;
    const postUrl = `https://www.facebook.com/${postId}`;

    console.log(`Berhasil terbit di Facebook!`);
    console.log(`Post ID: ${postId}`);
    console.log(`URL: ${postUrl}`);

    return {
      success: true,
      mode: 'live',
      postId,
      postUrl,
      imagePath,
      textPath
    };
  } catch (err) {
    console.error(`Gagal menghubungkan ke Facebook API: ${err.message}`);
    console.log(`File lokal tetap tersimpan di: ${imagePath}`);
    return {
      success: false,
      mode: 'error',
      error: err.message,
      imagePath,
      textPath
    };
  }
}

module.exports = {
  publishTurn
};
