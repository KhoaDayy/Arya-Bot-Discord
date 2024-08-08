const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const player = useMainPlayer();
require('dotenv').config();


module.exports = {
    data: new SlashCommandBuilder()
        .setName("play")
        .setDescription("Phát bài hát.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("search")
                .setDescription("Tìm kiếm bài hát.")
                .addStringOption(option =>
                    option
                        .setName("searchterms")
                        .setDescription('Tìm kiếm theo từ khóa.')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("playlist")
                .setDescription("Phát bài hát từ playlist từ Youtube.")
                .addStringOption(option =>
                    option
                        .setName("url")
                        .setDescription("Playlist URL.")
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("song")
                .setDescription("Phát nhạc từ Youtube.")
                .addStringOption(option =>
                    option
                        .setName("url")
                        .setDescription("URL bài hát từ Youtube.")
                        .setRequired(true)
                )
        ),

    run: async ({ interaction }) => {
        if (!interaction.member.voice.channel) {
            await interaction.reply("Bạn phải tham gia một kênh voice trước khi dùng lệnh này!");
            return;
        }
        const voiceChannel = interaction.member.voice.channel;
        const queue = player.nodes.get(interaction.guild.id);
        await interaction.deferReply({ fetchReply: true });

        let embed = new EmbedBuilder();

        if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString('url');

            const res = await player.play(voiceChannel, url, {
                nodeOptions: {
                    selfDeaf: true,
                    volume: 100,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 5000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 500000,
                    metadata: queue?.metadata || {
                        channel: interaction.channel,
                        client: interaction.guild.members.me,
                        requestedBy: interaction.user,
                        mess: await interaction.fetchReply()
                    }
                }
            });
            const trackRequester = res.track.requestedBy || interaction.user;
            embed
                .setDescription(`Thêm thành công **[${res.track.title}](${res.track.url})** vào hàng chờ.`)
                .setFooter({ text: `Được thêm bởi: ${trackRequester}`, iconURL: trackRequester.displayAvatarURL({ size: 1024 }) })
                .setThumbnail(res.track.thumbnail)
                .setTimestamp();

        } else if (interaction.options.getSubcommand() === "playlist") {
            let url = interaction.options.getString('url');

            const res = await player.play(voiceChannel, url, {
                nodeOptions: {
                    selfDeaf: false, // Đảm bảo bot không bị tắt âm thanh cho chính nó
                    volume: 100,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 5000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 500000,
                    metadata: queue?.metadata || {
                        channel: interaction.channel,
                        requestedBy: interaction.user,
                        mess: await interaction.fetchReply()
                    }
                },
            });

            const trackRequester = res.track.requestedBy || interaction.user;
            embed
                .setDescription(`Thêm thành công playlist **${res.track.title}** vào hàng chờ với ${res.track.length} bài hát.`)
                .setFooter({ text: `Được thêm bởi: ${trackRequester}`, iconURL: trackRequester.displayAvatarURL({ size: 1024 }) })
                .setThumbnail(res.track.thumbnail)
                .setTimestamp();

        } else if (interaction.options.getSubcommand() === "search") {
            let searchTerms = interaction.options.getString('searchterms');

            const res = await player.play(voiceChannel, searchTerms, {
                nodeOptions: {
                    selfDeaf: true,
                    volume: 100,
                    leaveOnEmpty: true,
                    leaveOnEmptyCooldown: 5000,
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 500000,
                    metadata: queue?.metadata || {
                        channel: interaction.channel,
                        requestedBy: interaction.user,
                        mess: await interaction.fetchReply()
                    }
                },
            });

            const trackRequester = res.track.requestedBy || interaction.user;
            embed
                .setDescription(`Thêm thành công **${res.track.title}**.`)
                .setFooter({ text: `Được thêm bởi: ${trackRequester}`, iconURL: trackRequester.displayAvatarURL({ size: 1024 }) })
                .setThumbnail(res.track.thumbnail)
                .setTimestamp();
        }
        await interaction.editReply({ embeds: [embed] });
    },
};
