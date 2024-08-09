const { EmbedBuilder, GuildMember } = require('discord.js');
const goodbyeSchema = require('../mongoDB/goodbye');


/**
 * @param {GuildMember} member - The new member object.
 */
const goodbye = async (member) => {
    const guildID = member.guild.id;

    const existingSetup = await goodbyeSchema.findOne({ guildID });
    if (!existingSetup) {
        return;
    }

    const channel = member.guild.channels.cache.get(existingSetup.channelID);
    if (!channel) {
        return;
    }

    const userAvatar = member.user.displayAvatarURL({ dynamic: true }); 

    const messageContent = {
        title: existingSetup.goodbyeMessage.title
            .replace('{SEVER_MEMBER}', member.guild.memberCount)
            .replace('{USER_MENTION}', `@<${member.user.id}>`)
            .replace('{USER_NAME}', member.user.username)
            .replace('{SEVER_NAME}', member.guild.name),
        subtitle: existingSetup.goodbyeMessage.subtitle
            .replace('{SEVER_MEMBER}', member.guild.memberCount)
            .replace('{USER_MENTION}', `@<${member.user.id}>`)
            .replace('{USER_NAME}', member.user.username)
            .replace('{SEVER_NAME}', member.guild.name),
        description: existingSetup.goodbyeMessage.description
            .replace('{SEVER_MEMBER}', member.guild.memberCount)
            .replace('{USER_MENTION}', `@<${member.user.id}>`)
            .replace('{USER_NAME}', member.user.username)
            .replace('{SEVER_NAME}', member.guild.name),
        image: existingSetup.goodbyeMessage.image
            .replace('{SEVER_MEMBER}', member.guild.memberCount)
            .replace('{USER_MENTION}', `@<${member.user.id}>`)
            .replace('{USER_NAME}', member.user.username)
            .replace('{SEVER_NAME}', member.guild.name)
    };
    
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: messageContent.title})
        .setTitle(messageContent.subtitle)
        .setThumbnail(userAvatar)
        .setDescription(messageContent.description)
        .setImage(messageContent.image)
        .setTimestamp()
        .setFooter({ text: "Server còn lại " + member.guild.memberCount +' member!'});

    return embed;
}

module.exports = goodbye