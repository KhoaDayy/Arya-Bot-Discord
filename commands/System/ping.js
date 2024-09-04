const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),
    execute: (interaction, client) => {
        const embed = new EmbedBuilder()
            .setTitle('Pong!')
            .setDescription(```\nĐộ trễ của bot: ${client.ws.ping}ms\n```)
        interaction.reply({ embeds: [embed] });
    },
};