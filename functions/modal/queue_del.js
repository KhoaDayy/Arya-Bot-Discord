const { useQueue } = require("discord-player");
const { ModalSubmitInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function isNumber(str) {
    return /^[0-9]+$/.test(str);
}

function removeDuplicates(array) {
    const seen = new Set();
    return array.filter(item => {
        if (!isNumber(item) || seen.has(item)) return false;
        seen.add(item);
        return true;
    });
}

module.exports.data = {
    name: "queue_del_modal",
    type: "modal",
}

/**
 * @param { ModalSubmitInteraction } interaction
 */
module.exports.execute = async (interaction) => {
    const { guild, client, fields } = interaction;
    const queue = useQueue(guild.id);

    const input = fields.getTextInputValue("del-input");
    const trackIndices = removeDuplicates(input.split(/[\s,;.+-]+/));

    if (!trackIndices.length || !queue || queue.isEmpty()) {
        await interaction.reply({ content: "❌ | Không thể xóa bài hát:\n" + `${trackIndices.join("\n")}`, ephemeral: true });
        return;
    }
    await interaction.deferReply();
    let tracldel = [];
    const validIndices = trackIndices.map(index => Math.abs(Number(index)) - 1).filter(index => index >= 0);
    validIndices.sort((a, b) => b - a).forEach(index => {
        tracldel.push(queue.tracks.toArray()?.[index]?.title);
        queue.removeTrack(index);
    });
    await interaction.editReply({
        content: "",
        embeds: [
            new EmbedBuilder()
                .setColor("Red")
                .setAuthor({ name: "Deleted track:", iconURL: client.user.displayAvatarURL({ size: 1024 }) })
                .setDescription(`${tracldel.map(t => `\n* ${t}`.slice(0, 50))}`.slice(0, 2000))
                .setTimestamp()
                .setFooter({ text: `Đã thêm bởi: ${interaction.user.tag} `, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
        ],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("cancel")
                    .setLabel("❌")
                    .setStyle(ButtonStyle.Secondary)
            )
        ]
    });

}
// const command = client.functions.get("Search");
// await command.execute(interaction, query);