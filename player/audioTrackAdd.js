const { EmbedBuilder } = require("discord.js")

module.exports = {
    name: 'audioTrackAdd',
    execute: async (client, queue, track) => {
        const embed = new EmbedBuilder()
        .setDescription(`Đã thêm bài hát:${track.title}`)
        .setColor('Random')
        .setFooter({
            text: `Đã thêm bởi ${queue.metadata.requestedBy.username}`,
            iconURL: queue.metadata.requestedBy.displayAvatarURL()
        })
        .setTimestamp()
        .setThumbnail(track.thumbnail)
    const replied = await queue.metadata?.channel?.send({embeds: [embed], fetchReply: true})
    setTimeout(function () {
            replied.delete().catch(err => {  });
    }, 5000)
    }
}