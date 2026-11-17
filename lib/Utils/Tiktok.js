const axios = require('axios');

/**
 * Scraper TikTok Multi-API (Vreden & Siputzx)
 * Mendukung Video, Audio, dan Slideshow
 */
async function tiktok(url) {
    if (!url) return { status: false, message: "URL tidak boleh kosong." };

    try {
        const vredenApi = `https://api.vreden.my.id/api/v1/download/tiktok?url=${encodeURIComponent(url.trim())}`;
        const siputzxApi = `https://api.siputzx.my.id/api/d/tiktok/v2?url=${encodeURIComponent(url.trim())}`;

        // Jalankan fetch secara bersamaan untuk efisiensi
        const [vredenRes, siputzxRes] = await Promise.all([
            axios.get(vredenApi).catch(() => ({ data: { status: false } })),
            axios.get(siputzxApi).catch(() => ({ data: { status: false } }))
        ]);

        const vreden = vredenRes.data;
        const siput = siputzxRes.data;

        // Validasi: Jika keduanya gagal, lempar error
        if (!vreden.status && !siput.status) {
            return { status: false, message: "Gagal mengambil data dari kedua provider API." };
        }

        // Tentukan data utama (Vreden prioritas untuk metadata, Siput prioritas untuk video/audio stabil)
        const main = vreden.status ? vreden.result : siput.data;
        
        // Cek apakah Slideshow
        const isSlideshow = vreden.status 
            ? main.data.some(v => v.type === "photo") 
            : (Array.isArray(siput.data?.slides) && siput.data.slides.length > 0);

        return {
            status: true,
            result: {
                title: main.title || main.text || '-',
                type: isSlideshow ? 'slideshow' : 'video',
                author: {
                    fullname: main.author?.fullname || main.author_nickname || '-',
                    nickname: main.author?.nickname || main.author_nickname || '-',
                    avatar: main.author?.avatar || null
                },
                stats: {
                    views: main.stats?.views || main.play_count || 0,
                    likes: main.stats?.likes || main.like_count || 0,
                    comment: main.stats?.comment || main.comment_count || 0,
                    share: main.stats?.share || main.share_count || 0
                },
                download: {
                    // Prioritas Link Video: Siput HD > Siput Normal > Vreden HD > Vreden Normal
                    video: siput.data?.no_watermark_link_hd || 
                           siput.data?.no_watermark_link || 
                           vreden.result?.data?.find(v => v.type === "nowatermark_hd")?.url || 
                           vreden.result?.data?.find(v => v.type === "nowatermark")?.url || null,
                    
                    // Prioritas Audio: Siput > Vreden
                    music: siput.data?.music_link || vreden.result?.music_info?.url || null,
                    
                    // Prioritas Photos: Vreden (karena struktur datanya lebih rapi untuk Baileys Carousel)
                    photos: vreden.status 
                        ? vreden.result.data.filter(v => v.type === "photo").map(v => v.url) 
                        : (siput.data?.slides || [])
                },
                // Simpan data mentah jika dibutuhkan untuk debug
                raw: { vreden: vreden.result || null, siput: siput.data || null }
            }
        };

    } catch (error) {
        return {
            status: false,
            message: "Internal Error: " + error.message
        };
    }
}

module.exports = tiktok;