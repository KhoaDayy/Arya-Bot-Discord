const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),
    run: ({interaction, client}) => {
        interaction.reply(`Pong! ${client.ws.ping}ms`);
    },
};