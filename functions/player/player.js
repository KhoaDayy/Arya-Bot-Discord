const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player');
const player = useMainPlayer();
const AryaIcons = require('./../../utility/icon');
const CreateButton = ({ id = null, label = null, style = ButtonStyle.Secondary, emoji = null, disable = true }) => {
    const button = new ButtonBuilder()
        .setCustomId(`player_${id}`)
        .setStyle(style)
        .setDisabled(disable);
    if (label) button.setLabel(label);
    if (emoji) button.setEmoji(emoji);
    return button;
};

const create_Related = async (track, history) => {
    try {
        let tracks = (await track.extractor?.getRelatedTracks(track, history))?.tracks || (await player.extractors.run(async (ext) => {
            const res = await ext.getRelatedTracks(track, history);
            if (!res.tracks.length) {
                return false;
            }
            return res.tracks;
        }))?.result || [];

        if (!tracks.length) tracks = (await player.extractors.run(async (ext) => {
            const res = await ext.getRelatedTracks(track, history);
            if (!res.tracks.length) {
                return false;
            }
            return res.tracks;
        }))?.result || [];

        const unique = tracks.filter((tr) => !history.tracks.find((t) => t.url === tr.url));
        if (unique) return unique;
        return [];
    } catch (error) {
        console.log(error);
        return [];
    }
};

const repeatMode = ["OFF", "TRACK", "QUEUE", "AUTOPLAY"];

module.exports = {
    data: {
        name: 'player',
        type: 'player',
    },

    execute: async (client, queue, tracks) => {
        const track = tracks ?? queue.currentTrack;
        const requestedBy = track?.requestedBy ?? queue.metadata.requestedBy;
        let code = {};
        const process = queue.node.createProgressBar({
            leftChar: '﹏',
            rightChar: '﹏',
            indicator: '𓊝',
        });
        const embed = new EmbedBuilder()
            .setDescription(`Đang phát: **[${track.title}](${track.url})**\nVolume: **${queue.node.volume}%**`)
            .setColor('Random')
            .setFooter({
                text: `Đã thêm bởi ${requestedBy.username}`,
                iconURL: requestedBy.displayAvatarURL()
            })
            .setTimestamp()
            .setImage(track.thumbnail)
            .addFields({
                name: " ",
                value: `${process}`
            });
        if (queue.repeatMode !== 0)
            embed.addFields({ name: `Lặp lại: ${repeatMode[queue.repeatMode]}`, value: " ", inline: false });
        code.embeds = [embed];

        if (queue.node.isPlaying() || !queue.isEmpty()) {
            const getRelatedTracks = await create_Related(track, queue?.history);
            const _getRelatedTracks = getRelatedTracks.filter(t => t.url.length < 100).slice(0, 10);
            const creator_Track = _getRelatedTracks.map((track, i) => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(`${i + 1} : ${track.title}`.slice(0, 99))
                    .setDescription(`Thời lượng: ${(track.duration)} Nguồn: ${(track.queryType)}`)
                    .setValue(track.url)
                    .setEmoji('<:musicicon:1271068740116676691>');
            });

            const getRelatedTracksrow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("player_SelectionTrack")
                    .setPlaceholder('➤ | Chọn bài hát để thêm vào hàng đợi')
                    .addOptions(creator_Track)
                    .setMaxValues(1)
                    .setDisabled(!creator_Track.length)
            );

            const _func = [{
                Label: 'Search Tracks',
                Description: 'Tìm kiếm bài hát.',
                Value: 'search',
                Emoji: AryaIcons.search
            }, {
                Label: 'Loop',
                Description: 'Lặp lại bài hát',
                Value: 'loop',
                Emoji: AryaIcons.loop
            }, {
                Label: 'AutoPlay',
                Description: 'Tự động phát!',
                Value: 'autoplay',
                Emoji: AryaIcons.auto_play
            }, {
                Label: 'Queue',
                Description: 'Hàng Đợi',
                Value: 'Queue',
                Emoji: AryaIcons.queue
            }, {
                Label: 'Mute',
                Description: 'Set Âm lượng về 0%',
                Value: 'mute',
                Emoji: AryaIcons.mute
            }, {
                Label: 'Volume +',
                Description: 'Tăng Âm lượng',
                Value: 'volumeinc',
                Emoji: AryaIcons.volume_up
            }, {
                Label: 'Volume -',
                Description: 'Giảm âm lượng',
                Value: 'volumedec',
                Emoji: AryaIcons.volume_down
            }, {
                Label: 'Lyrics',
                Description: 'Lời bài hát của bài hát đang phát!',
                Value: 'lyrics',
                Emoji: AryaIcons.lyrics
            }, {
                Label: 'Shuffle',
                Description: 'Trộn bài hát',
                Value: 'shuffle',
                Emoji: AryaIcons.shuffle
            }];

            const __func = _func.filter(function (f) {
                if (queue.isEmpty()) {
                    if (f.Label === "Shuffle" || f.Label === "Loop" || f.Label === "Queue")
                        return false;
                }
                if (queue.node.volume > 99 && f.Value === 'volumeinc') return false;
                if (queue.node.volume < 1 && f.Value === 'volumedec') return false;
                return true;
            });

            const creator_Func = _func.map((f) => {
                return new StringSelectMenuOptionBuilder()
                    .setLabel(f.Label)
                    .setDescription(f.Description)
                    .setValue(f.Value)
                    .setEmoji(f.Emoji);
            });

            const getRelatedFuncrow = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("player_SelectionFunc")
                    .setPlaceholder('➤ | Chọn một chức năng để điều khiển player')
                    .addOptions(creator_Func)
                    .setMaxValues(1)
            );

            const button = new ActionRowBuilder().addComponents(
                CreateButton({
                    id: 'refesh',
                    emoji: `${AryaIcons.refesh}`,
                    disable: false
                }),
                CreateButton({
                    id: 'previous',
                    emoji: `${AryaIcons.previous}`,
                    disable: !queue?.history?.previousTrack
                }),
                CreateButton({
                    id: 'pause',
                    emoji: `${queue.node.isPlaying() ? `${AryaIcons.pause}` : `${AryaIcons.play}`}`,
                    disable: false
                }),
                CreateButton({
                    id: 'next',
                    emoji: `${AryaIcons.next}`,
                    disable: false
                }),
                CreateButton({
                    id: 'stop',
                    emoji: `${AryaIcons.stop}`,
                    disable: false
                }),
            );

        
            code.components = [getRelatedTracksrow, getRelatedFuncrow, button];
        }

        return code;
    }
};