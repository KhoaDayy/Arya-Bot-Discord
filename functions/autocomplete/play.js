const { useMainPlayer } = require('discord-player');
const player = useMainPlayer();

module.exports.data = {
    name: "play",
    description: "Tìm kiếm bài hát.",
    type: "autocomplete",
};

module.exports.execute = async (interaction) => {
    try {
        const query = interaction.options.getString('query').trim();

        // Kiểm tra nếu query không rỗng
        if (!query) {
            await interaction.respond([
                { name: 'Vui lòng nhập một từ khóa tìm kiếm.', value: 'error' }
            ]);
            return;
        }

        const results = await player.search(query, {
            fallbackSearchEngine: "youtube"
        });

        // Tạo danh sách các lựa chọn cho phản hồi autocomplete
        const choices = results.tracks.slice(0, 10).map(track => ({
            name: track.title,
            value: track.url
        }));

        // Gửi phản hồi autocomplete
        await interaction.respond(choices);
    } catch (error) {
        console.error('Lỗi khi xử lý autocomplete:', error);

        // Gửi phản hồi lỗi cho người dùng
        await interaction.respond([
            { name: 'Có lỗi xảy ra. Vui lòng thử lại sau.', value: 'error' }
        ]);
    }
};
