const { useMainPlayer, useQueue } = require('discord-player');
const player = useMainPlayer();
const {EmbedBuilder, ButtonStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder} = require('discord.js');
const AryaIcons = require('./../../utility/icon');
//====================================================================//

function validURL(str) {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}

async function buildImageInWorker(searchPlayer, query) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./utility/worker.js', {
            workerData: { searchPlayer, query }
        });

        worker.on('message', (arrayBuffer) => {
            try {
                const buffer = Buffer.from(arrayBuffer);
                if (!Buffer.isBuffer(buffer)) {
                    throw new Error('Received data is not a buffer');
                }
                const attachment = new AttachmentBuilder(buffer, { name: 'search.png' });
                resolve(attachment);
            } catch (error) {
                reject(error);
            } finally {
                worker.postMessage('terminate');
            }
        });

        worker.on('error', reject);

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

//====================================================================//
module.exports = {
    data: {
        name: 'search',
        type: 'player',
    },

    execute: async (interaction, query) => {
            const voiceChannel = interaction.member.voice.channel;

            if (!voiceChannel) {
                await interaction.reply("Bạn phải tham gia một kênh voice trước khi dùng lệnh này!");
                return;
            }

            const voiceMe = interaction.guild.members.cache.get(interaction.client.user.id).voice.channel;

            if (voiceMe && voiceMe.id !== voiceChannel.id) {
                await interaction.reply('Bot đang tham gia một kênh thoại khác!');
                return;
            }

            await interaction.deferReply({ fetchReply: true });
            const queue = useQueue(interaction.guild.id);
            if (validURL(query)) {
                await player.play(voiceChannel, query, {
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
                    }
                })
                if(queue?.metadata) return interaction.deleteReply().catch(err => {  });
                return;
        }  
        const results = await player.search(query,{
            fallbackSearchEngine: "youtube"
        })
        const tracks = results.tracks.filter(t => t.url. length < 100).slice(0, 10)
        if (!tracks.length) return interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setTitle('Không tìm thấy kết quả nào cho:')
                .setDescription(`${query}`)
                .setColor('Red')
            ],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('Cancel')
                    .setLabel('❌')
                    .setStyle(ButtonStyle.Secondary)
                )
            ]
        });
        const creator_Track = tracks.map((track,i) => {
            return new StringSelectMenuOptionBuilder()
            .setLabel(`${i + 1} : ${track.title}`.slice(0, 99))
            .setDescription(`Thời lượng: ${(track.duration)} Nguồn: ${(track.queryType)}`)
            .setValue(track.url)
            .setEmoji('<:musicicon:1271068740116676691>')
        })
        const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId("player_SelectionTrack")
            .setPlaceholder('➤ | Chọn bài hát để phát')
            .addOptions(creator_Track)
            .setMaxValues(1)
            .setMaxValues(1)
        )
        const embed = new EmbedBuilder()
        .setTitle("Tìm kiếm kết quả:")
        .setDescription(`${query}`)
        .setColor('Random')
        .addFields(tracks.map((track,i) => ({
            name: `${i + 1}: ${track.title.slice(0, 50)} \`[${track.duration}]\``.slice(0, 99),
            value: ` `,
            inline: false
    })))
    return interaction.editReply({embeds: [embed], components: [row]})
    } 
};  
