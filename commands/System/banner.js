const { SlashCommandBuilder, EmbedBuilder, Routes, DataResolver, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botbanner')
        .setDescription('Set banner cho bot!')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addAttachmentOption(option =>
            option
                .setName('getbanner')
                .setDescription('Banner muốn thay đổi')
                .setRequired(true)
        ),


        execute: async (interaction, client) => {
            await interaction.deferReply();
        
            const banner = interaction.options.getAttachment('getbanner');
            
            if (!banner) {
                await interaction.editReply({
                    content: 'Vui lòng tải lên một banner hợp lệ.',
                    ephemeral: true
                });
                return;
            }
        
            async function sendMessage(message) {
                const embed = new EmbedBuilder()
                    .setColor('Blurple')
                    .setDescription(message);
        
                await interaction.editReply({ embeds: [embed], ephemeral: true });
            }
        
            // Kiểm tra định dạng của banner
            if (banner.contentType !== 'image/gif' && banner.contentType !== 'image/png') {
                return await sendMessage('Vui lòng dùng định dạng Gif hoặc Png ở banner!');
            }
        
            let error;
            try {
                // Kiểm tra URL của banner
                console.log('Banner URL:', banner.url);
        
                // Cập nhật banner người dùng
                await client.rest.patch(Routes.user(), {
                    body: { banner: banner.url }
                });
            } catch (err) {
                error = true;
                await sendMessage(`Đã xảy ra lỗi: ${err.toString()}`);
            }
        
            if (error) return;
            await sendMessage('Đã thay đổi banner thành công!');
        }
}
