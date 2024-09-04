const { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayaka')
        .setDescription('Fetch a random Ayaka image'),

    execute: async (interaction ) => {
        const command = interaction.client.functions.get("ayaka");
        await command.execute(interaction)
    }
};
