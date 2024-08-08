const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const welcomeSchema = require('../../mongoDB/welcome');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcome-test')
        .setDescription('Test thông báo Welcome')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    run: async ({ interaction }) => {
        try {
            const guildID = interaction.guild.id;

            const existingSetup = await welcomeSchema.findOne({ guildID });
            if (!existingSetup) {
                return await interaction.reply({
                    content: 'Vui lòng sử dụng /welcome-setup để setup welcome trước khi test',
                });
            }

            const channel = interaction.guild.channels.cache.get(existingSetup.channelID);
            if (!channel) {
                return await interaction.reply({
                    content: 'Tùy chỉnh welcome channel không tồn tại.'
                });
            }

            const userAvatar = interaction.user.displayAvatarURL({ dynamic: true });

            const messageContent = {
                title: existingSetup.welcomeMessage.title
                    .replace('{SEVER_MEMBER}', interaction.guild.memberCount)
                    .replace('{USER_MENTION}', `@<${interaction.user.id}>`)
                    .replace('{USER_NAME}', interaction.user.username)
                    .replace('{SEVER_NAME}', interaction.guild.name),
                subtitle: existingSetup.welcomeMessage.subtitle
                    .replace('{SEVER_MEMBER}', interaction.guild.memberCount)
                    .replace('{USER_MENTION}', `@<${interaction.user.id}>`)
                    .replace('{USER_NAME}', interaction.user.username)
                    .replace('{SEVER_NAME}', interaction.guild.name),
                description: existingSetup.welcomeMessage.description
                    .replace('{SEVER_MEMBER}', interaction.guild.memberCount)
                    .replace('{USER_MENTION}', `@<${interaction.user.id}>`)
                    .replace('{USER_NAME}', interaction.user.username)
                    .replace('{SEVER_NAME}', interaction.guild.name),
                image: existingSetup.welcomeMessage.image
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

            await interaction.reply({ content: 'Gửi thông báo test welcome thành công', ephemeral: true });

        } catch (error) {
            console.log('Đã xảy ra lỗi: ' + error);
        }
    }
};
