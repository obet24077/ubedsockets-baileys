const axios = require('axios');

/**
 * Scraper Facebook untuk @ubedsockets/baileys
 * @param {string} url - Link video Facebook
 * @returns {Promise<Object>} Data hasil scrape dengan format konsisten
 */
async function facebook(url) {
    if (!url) throw new Error("URL tidak boleh kosong.");

    const apiUrl = `https://api.ubed.my.id/download/facebook?apikey=alhamdulillah&url=${encodeURIComponent(url)}`;

    try {
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.result) {
            throw new Error(data.message || "Gagal mendapatkan data dari Facebook.");
        }

        const res = data.result;

        // Mencari resolusi terbaik (prioritas 720p atau yang paling tinggi)
        const video720 = res.video.find(v => /720/.test(v.quality));
        const bestVideo = video720 || [...res.video].sort((a, b) => parseInt(b.quality) - parseInt(a.quality))[0];

        return {
            status: true,
            title: res.title || '-',
            metadata: {
                duration: res.duration || '00:00',
                thumbnail: res.thumbnail || null,
                source: url
            },
            download: {
                url: bestVideo.url,
                quality: bestVideo.quality,
                all_qualities: res.video // Tetap sertakan semua pilihan jika bot ingin memproses pilihan resolusi
            }
        };
    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

module.exports = facebook;