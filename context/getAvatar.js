const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
module.exports = {
    data:new ContextMenuCommandBuilder()
        .setName('Get Avatar')
        .setType(ApplicationCommandType.User),
    
    execute: async (interaction) => {
        await interaction.reply(interaction.targetUser.displayAvatarURL())
        }
    }