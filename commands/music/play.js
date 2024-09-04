const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, useQueue } = require('discord-player');


const player = useMainPlayer();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Phát bài hát.")
        .addStringOption(options =>
            options
                .setName("query")
                .setDescription('Tìm kiếm theo từ khóa.')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        const query = interaction.options?.getString('query');
        const command = interaction.client.functions.get("search");
        await command.execute(interaction, query)
        return;
    }
};
