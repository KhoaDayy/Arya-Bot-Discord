const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const goodbyeSchema = require('../../mongoDB/goodbye');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('goodbye-setup')
        .setDescription('Thiết lập hệ thống goodbye cho server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    execute: async ( interaction ) => {
        try {
            const modal = new ModalBuilder()
                .setCustomId(`goodbye-modal-${interaction.user.id}`)
                .setTitle('Thiết lập goodbye');

            const channelID = new TextInputBuilder()
                .setCustomId('channel')
                .setLabel('Channel bạn muốn gửi goodbye?')
                .setStyle(TextInputStyle.Short);

            const title = new TextInputBuilder()
                .setCustomId('main-title')
                .setLabel('Tiêu đề chính')
                .setStyle(TextInputStyle.Short);

            const subtitle = new TextInputBuilder()
                .setCustomId('sub-title')
                .setLabel('Tiêu đề phụ')
                .setStyle(TextInputStyle.Short);

            const description = new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Mô tả')
                .setStyle(TextInputStyle.Paragraph);

            const image = new TextInputBuilder()
                .setCustomId('image')
                .setLabel('Hình ảnh')
                .setStyle(TextInputStyle.Short);

            const channelRow = new ActionRowBuilder().addComponents(channelID);
            const titleRow = new ActionRowBuilder().addComponents(title);
            const subtitleRow = new ActionRowBuilder().addComponents(subtitle);
            const descriptionRow = new ActionRowBuilder().addComponents(description);
            const imageRow = new ActionRowBuilder().addComponents(image);
            

            modal.addComponents(channelRow, titleRow, subtitleRow, descriptionRow, imageRow);

            await interaction.showModal(modal);

            // Xử lý khi modal được gửi
            const filter = (i) => i.customId === `goodbye-modal-${interaction.user.id}`;
            const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 300_000 }) // Thời gian chờ 5 phút
                .catch(error => {
                    console.error('Modal submit error:', error);
                    return null;
                });

            if (!modalInteraction) {
                return await interaction.followUp({ content: 'Thời gian chờ modal đã hết. Vui lòng thử lại.', ephemeral: true });
            }

            const getchannelID = modalInteraction.fields.getTextInputValue('channel');
            const goodbyeMessage = {
                title: modalInteraction.fields.getTextInputValue('main-title'),
                subtitle: modalInteraction.fields.getTextInputValue('sub-title'),
                description: modalInteraction.fields.getTextInputValue('description'),
                image: modalInteraction.fields.getTextInputValue('image')
            };

            const guildID = interaction.guild.id;
            const existing = await goodbyeSchema.findOneAndUpdate({ guildID });

            if (existing) {
                existing.channelID = getchannelID;
                existing.goodbyeMessage = goodbyeMessage;
                await existing.save();
                return await modalInteraction.reply({ content: 'Cập nhật goodbye thành công!', ephemeral: true });
            }

            await goodbyeSchema.create({ guildID, channelID: getchannelID, goodbyeMessage });
            await modalInteraction.reply({ content: 'Thiết lập goodbye thành công!', ephemeral: true });

        } catch (error) {
            console.error('Error in goodbye setup:', error);
            await interaction.reply({ content: 'Đã xảy ra lỗi', ephemeral: true });
        }
    }
};
