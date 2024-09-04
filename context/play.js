const { ContextMenuCommandBuilder } = require("discord.js");
const { useMainPlayer } = require('discord-player');

const player = useMainPlayer();

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Play / Add Music")
        .setType(3),

    execute: async (interaction) => {
        const query = interaction.targetMessage.content;

        const command = interaction.client.functions.get("search");
        await command.execute(interaction, query)
    }
};
