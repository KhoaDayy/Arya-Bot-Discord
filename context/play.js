const { ContextMenuCommandBuilder } = require("discord.js");
const { useMainPlayer } = require('discord-player');

const player = useMainPlayer();

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Play / Add Music")
        .setType(3),

    run: async (interaction) => {
        const command = interaction.client.commands.get("play")
        await command.run(interaction)
    }
};
