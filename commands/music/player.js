const { useMainPlayer, useQueue } = require("discord-player");
const { CommandInteraction, SlashCommandBuilder } = require("discord.js");
const player = useMainPlayer()

/**
 * 
 * @param { CommandInteraction } interaction 
 */

module.exports = {
data: new SlashCommandBuilder()
    .setName("player")
    .setDescription("Gọi giao diện player"),



execute: async (interaction) => {
    //const { client, guild } = interaction
    await interaction.deferReply();
    const queue = useQueue(interaction.guild.id);
    if (!queue) return interaction.editReply({ content: "Hiện Không Có bài hát nào đang phát" });
    queue.metadata.mess.edit({ components: [] })
    const EditMetadata = interaction.client.functions.get("EditMetadata");
    await EditMetadata.execute(interaction.guild, { mess: await interaction.fetchReply() });
    const player = interaction.client.functions.get("player");
    if (!player) return;
    const res = await player.execute(interaction.client, queue)
    await interaction.editReply(res);
}
}