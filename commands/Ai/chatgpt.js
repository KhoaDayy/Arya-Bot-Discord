const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chatgpt')
        .setDescription('Chat bot với ChatGPT-3-5-Turbo')
        .addSubcommand(subcommand =>
            subcommand
                .setName('chat')
                .setDescription('Chat với ChatGPT')
                .addStringOption(option =>
                    option
                        .setName('message')
                        .setDescription('Nội dung bạn muốn gửi đến ChatGPT')
                        .setRequired(true)
                )
        ),

     run: async({interaction}) => {
        try {
            const chatget = interaction.options.getString('message');

            // Trì hoãn phản hồi để đảm bảo không bị hết hạn
            await interaction.deferReply();

            const res = await axios.get(`https://2d64-47-76-246-147.ngrok-free.app/chatgpt/chat?ask=${chatget}`);
            const asw = res.data.gpt;

            // Cập nhật phản hồi
            await interaction.editReply(asw);
        } catch (error) {
            console.error('Error handling command:', error);
            await interaction.editReply('Đã xảy ra lỗi trong khi xử lý lệnh.');
        }
    },
};
