const axios = require('axios');

/**
 * Scraper Instagram untuk @ubedsockets/baileys
 * @param {string} url - Link postingan Instagram
 * @returns {Promise<Object>} Data JSON hasil scrape
 */
async function instagram(url) {
    if (!url) throw new Error("URL tidak boleh kosong.");

    const apiUrl = `https://api.vreden.my.id/api/v1/download/instagram?url=${encodeURIComponent(url)}`;

    try {
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.result) {
            throw new Error("Gagal mendapatkan data dari Instagram.");
        }

        const res = data.result;

        return {
            status: true,
            title: res.caption?.text || '-',
            metadata: {
                user: {
                    username: res.profile.username,
                    fullname: res.profile.full_name,
                    avatar: res.profile.profile_pic_url
                },
                stats: {
                    likes: res.statistics.like_count,
                    comments: res.statistics.comment_count
                }
            },
            // List media dikembalikan sebagai array agar bot bisa handle Carousel
            download: res.data.map(item => ({
                type: item.type, // 'image' atau 'video'
                url: item.url
            }))
        };
    } catch (error) {
        return {
            status: false,
            message: error.message
        };
    }
}

module.exports = instagram;