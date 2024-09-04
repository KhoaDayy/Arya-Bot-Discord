const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const goodbyeSchema = require('../../mongoDB/goodbye');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('goodbye-test')
        .setDescription('Test thông báo goodbye')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    execute: async ( interaction ) => {
        try {
            const guildID = interaction.guild.id;

            const existingSetup = await goodbyeSchema.findOne({ guildID });
            if (!existingSetup) {
                return await interaction.reply({
                    content: 'Vui lòng sử dụng /goodbye-setup để setup goodbye trước khi test',
                });
            }

            const channel = interaction.guild.channels.cache.get(existingSetup.channelID);
            if (!channel) {
                return await interaction.reply({
                    content: 'Tùy chỉnh goodbye channel không tồn tại.'
                });
            }

            const userAvatar = interaction.user.displayAvatarURL({ dynamic: true });

            const messageContent = {
                title: existingSetup.goodbyeMessage.title
                    .replace('{SEVER_MEMBER}', interaction.guild.memberCount)
                    .replace('{USER_MENTION}', `@<${interaction.user.id}>`)
                    .replace('{USER_NAME}', interaction.user.username)
                    .replace('{SEVER_NAME}', interaction.guild.name),
                subtitle: existingSetup.goodbyeMessage.subtitle
                    .replace('{SEVER_MEMBER}', interaction.guild.memberCount)
                    .replace('{USER_MENTION}', `@<${interaction.user.id}>`)
                    .replace('{USER_NAME}', interaction.user.username)
                    .replace('{SEVER_NAME}', interaction.guild.name),
                description: existingSetup.goodbyeMessage.description
                    .replace('{SEVER_MEMBER}', interaction.guild.memberCount)
                    .replace('{USER_MENTION}', `@<${interaction.user.id}>`)
                    .replace('{USER_NAME}', interaction.user.username)
                    .replace('{SEVER_NAME}', interaction.guild.name),
                image: existingSetup.goodbyeMessage.image
                    .replace('{SEVER_MEMBER}', interaction.guild.memberCount)
                    .replace('{USER_MENTION}', `@<${interaction.user.id}>`)
                    .replace('{USER_NAME}', interaction.user.username)
                    .replace('{SEVER_NAME}', interaction.guild.name)
            };
            
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setAuthor({ name: messageContent.title })
                .setTitle(messageContent.subtitle)
                .setThumbnail(userAvatar)
                .setDescription(messageContent.description)
                .setImage(messageContent.image)
                .setFooter({ text: "Bạn là thành viên thứ: " + interaction.guild.memberCount });

            await channel.send({
                content: `<@${interaction.user.id}>`,
                embeds: [embed]
            });

            await interaction.reply({ content: 'Gửi thông báo test goodbye thành công', ephemeral: true });

        } catch (error) {
            console.log('Đã xảy ra lỗi: ' + error);
        }
    }
};
