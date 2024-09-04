const { SlashCommandBuilder } = require("discord.js");
const { useMainPlayer, useQueue } = require('discord-player');

const player = useMainPlayer();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("volume")
        .setDescription("Chỉnh âm lượng nhạc.")
        .addIntegerOption(option =>
            option
                .setName("vol")
                .setDescription('Nhập âm lượng')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)
        ),  
    execute: async (interaction) => {
        await interaction.deferReply({fetchReply: true})
        const  vol = interaction.options.getInteger('vol');
        queue = useQueue(interaction.guild.id);

        if (!queue) return interaction.editReply("Hiện không có bài hát nào đang phát.")

        queue.node.setVolume(vol)

        await interaction.editReply(`Đã thay đổi âm lượng bài nhạc: ${vol}%`)

    }
};
