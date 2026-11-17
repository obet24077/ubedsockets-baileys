const axios = require('axios');

/**
 * Scraper YouTube untuk @ubedsockets/baileys
 * @param {string} url - Link YouTube
 * @returns {Promise<Object>} Data JSON hasil scrape
 */
async function youtube(url) {
    if (!url) throw new Error("URL tidak boleh kosong.");

    const apiUrl = `https://api.fruatre.my.id/api/ytplay?url=${encodeURIComponent(url)}`;
    
    try {
        const { data: res } = await axios.get(apiUrl);
        
        if (!res.status || !res.data?.result?.dl) {
            throw new Error("Gagal mengambil data dari YouTube.");
        }

        const meta = res.data.result;

        return {
            status: true,
            title: meta.title,
            metadata: {
                format: meta.format,
                quality: meta.quality,
                thumbnail: meta.thumb, // Ini yang nanti dipakai buat canvas di bot
                size: meta.size,
                kbps: meta.kbps
            },
            download: {
                url: meta.dl
            }
        };
    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

module.exports = youtube;