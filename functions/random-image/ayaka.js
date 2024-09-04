const axios = require('axios');
const { ButtonBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'ayaka',
        type: 'image',
    },

    execute: async (interaction) => {
        try {
            // Defer the reply to acknowledge the command
            await interaction.deferReply();
            
            // Fetch the random image from the API
            const response = await axios.get('https://random-image-api-b39c.onrender.com/random-image/ayaka');
            const { imageUrl, author } = response.data;

            // Ensure URL starts with 'http://' or 'https://'
            if (!/^https?:\/\//i.test(imageUrl)) {
                throw new Error('Invalid image URL format.');
            }

            // Create a button
            const button = new ButtonBuilder()
                .setCustomId('ayaka_button')
                .setLabel('Ảnh mới')
                .setStyle('Primary');

            // Create an action row to hold the button
            const row = new ActionRowBuilder()
                .addComponents(button);

            // Create an embed with the image URL
            const embed = new EmbedBuilder()
                .setTitle('Random Ayaka Image!')
                .setDescription('Lấy thành công ảnh của Ayaka!')
                .setImage(imageUrl)  // Ensure imageUrl is a string URL
                .setTimestamp()
                .setColor('Random')
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })

            // Edit the deferred reply with the embed and button
            await interaction.editReply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Error fetching image:', error);
            try {
                // If an error occurs, edit the reply to indicate the issue
                await interaction.editReply({
                    content: 'Đã xảy ra lỗi khi lấy ảnh.',
                    components: [] // Remove any components on error
                });
            } catch (replyError) {
                console.error('Error editing reply:', replyError);
            }
        }
    }
}
