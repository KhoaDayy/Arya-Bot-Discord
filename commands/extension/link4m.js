const axios = require('axios');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('link4m')
        .setDescription('Tạo Link rút gọn bằng link4m')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('link')
                .setDescription('Link muốn tạo')
                .setRequired(true)
        ),
    
    run: async ({ interaction }) => {
        const url = interaction.options.getString('link');
        const API_TOKEN = '66bb284f9009ef0c30286547'; // Mã thông báo API của Link4m
        const LINK4M_URL = 'https://link4m.co/api-shorten/v2'; // URL API của Link4m

        try {
            const response = await axios.get(`${LINK4M_URL}?api=${API_TOKEN}&url=${encodeURIComponent(url)}`);
            //console.log('API Response:', response.data); // Xem phản hồi từ API
            
            // Sử dụng phản hồi chính xác
            const shortenedLink = response.data.shortenedUrl; 

            await interaction.reply(`Link rút gọn của bạn: ${shortenedLink}`);
        } catch (error) {
            console.error('Lỗi khi rút gọn liên kết:', error.message);
            await interaction.reply('Đã xảy ra lỗi khi rút gọn liên kết. Vui lòng kiểm tra lại và thử lại sau.');
        }
    }
}
