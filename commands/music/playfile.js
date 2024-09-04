const { SlashCommandBuilder } = require('discord.js');
const { createAudioPlayer, joinVoiceChannel, createAudioResource } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playfile')
        .setDescription('Phát nhạc từ file')
        .addAttachmentOption(option => 
            option
                .setName('file')
                .setDescription('File cần phát')
                .setRequired(true)
        ),

    execute: async ( interaction ) => {
        const file = interaction.options.getAttachment('file');
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ content: 'Bạn cần tham gia một kênh giọng nói để sử dụng lệnh này!', ephemeral: true });
        }

        const resource = createAudioResource(file.url);

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        player.play(resource);
        connection.subscribe(player);

        interaction.reply({ content: `Đang phát: ${file.name}`, ephemeral: true });

        player.on('error', error => {
            console.error('Có lỗi xảy ra:', error);
            interaction.followUp({ content: 'Đã xảy ra lỗi khi phát tệp.', ephemeral: true });
        });
    },
};
