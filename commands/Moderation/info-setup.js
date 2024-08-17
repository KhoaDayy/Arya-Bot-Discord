const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField } = require('discord.js');
const infoseverSchema = require('../../mongoDB/info');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info-setup')
        .setDescription('Thiết lập Thông Tin cho server'),

    run: async ({interaction}) => {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.reply({ content: 'Bạn không đủ quyền hạn để sử dụng lệnh này.', ephemeral: true });
        }

        try {
            const modal = new ModalBuilder()
                .setCustomId(`info-modal-${interaction.user.id}`)
                .setTitle('Thiết lập Thông Tin');

            const totalcountID = new TextInputBuilder()
                .setCustomId('totalcountID')
                .setLabel('ID channel tổng người tham gia sever')
                .setStyle(TextInputStyle.Short);

            const membercountID = new TextInputBuilder()
                .setCustomId('membercountID')
                .setLabel('ID channel tổng members')
                .setStyle(TextInputStyle.Short);

            const botcountID = new TextInputBuilder()
                .setCustomId('botcountID')
                .setLabel('ID channel tổng bots')
                .setStyle(TextInputStyle.Short);

            const totalcount = new ActionRowBuilder().addComponents(totalcountID);
            const membercount = new ActionRowBuilder().addComponents(membercountID);
            const botcount = new ActionRowBuilder().addComponents(botcountID);

            modal.addComponents(totalcount, membercount, botcount);

            await interaction.showModal(modal);

            const filter = (i) => i.customId === `info-modal-${interaction.user.id}` && i.user.id === interaction.user.id;

            // Collector với thời gian chờ 5 phút
            try {
                const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 300000 }); // 5 phút = 300000 milliseconds

                const guildID = interaction.guild.id;
                const countID = {
                    TotalID: modalInteraction.fields.getTextInputValue('totalcountID'),
                    MemberID: modalInteraction.fields.getTextInputValue('membercountID'),
                    BotID: modalInteraction.fields.getTextInputValue('botcountID'),
                };

                await infoseverSchema.create({
                    guildID: guildID,
                    countID: countID,
                });

                await modalInteraction.reply({ content: 'Thiết lập thành công!', ephemeral: true });

            } catch (error) {
                if (error.code === 'InteractionCollectorError') {
                    await interaction.followUp({ content: 'Không nhận được phản hồi từ người dùng. Hủy thiết lập.', ephemeral: true });
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.log(error);
            if (!interaction.replied) {
                await interaction.reply({ content: 'Đã xảy ra lỗi: ' + error.message, ephemeral: true });
            } else {
                await interaction.followUp({ content: 'Đã xảy ra lỗi: ' + error.message, ephemeral: true });
            }
        }
    }
};
