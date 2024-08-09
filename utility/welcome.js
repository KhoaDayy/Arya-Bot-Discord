const { EmbedBuilder, GuildMember } = require('discord.js');
const welcomeSchema = require('../mongoDB/welcome');


/**
 * @param {GuildMember} member - The new member object.
 */
const welcome = async (member) => {
    const guildID = member.guild.id;

    const existingSetup = await welcomeSchema.findOne({ guildID });
    if (!existingSetup) {
        return;
    }

    const channel = member.guild.channels.cache.get(existingSetup.channelID);
    if (!channel) {
        return;
    }

    const userAvatar = member.user.displayAvatarURL({ dynamic: true }); 

    const messageContent = {
        title: existingSetup.welcomeMessage.title
            .replace('{SEVER_MEMBER}', member.guild.memberCount)
            .replace('{USER_MENTION}', `@<${member.user.id}>`)
            .replace('{USER_NAME}', member.user.username)
            .replace('{SEVER_NAME}', member.guild.name),
        subtitle: existingSetup.welcomeMessage.subtitle
            .replace('{SEVER_MEMBER}', member.guild.memberCount)
            .replace('{USER_MENTION}', `@<${member.user.id}>`)
            .replace('{USER_NAME}', member.user.username)
            .replace('{SEVER_NAME}', member.guild.name),
        description: existingSetup.welcomeMessage.description
            .replace('{SEVER_MEMBER}', member.guild.memberCount)
            .replace('{USER_MENTION}', `@<${member.user.id}>`)
            .replace('{USER_NAME}', member.user.username)
            .replace('{SEVER_NAME}', member.guild.name),
        image: existingSetup.welcomeMessage.image
            .replace('{SEVER_MEMBER}', member.guild.memberCount)
            .replace('{USER_MENTION}', `@<${member.user.id}>`)
            .replace('{USER_NAME}', member.user.username)
            .replace('{SEVER_NAME}', member.guild.name)
    };
    
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: messageContent.title })
        .setTitle(messageContent.subtitle)
        .setThumbnail(userAvatar)
        .setDescription(messageContent.description)
        .setImage(messageContent.image)
        .setFooter({ text: "Bạn là thành viên thứ " + member.guild.memberCount +' của sever!'});

    return embed;
}

module.exports = welcome