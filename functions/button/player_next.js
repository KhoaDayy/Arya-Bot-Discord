const { useMainPlayer, useQueue } = require("discord-player");

const player = useMainPlayer();

module.exports = {
    data: {
        name: "player_next",
        type: "button",
    },

    execute: async (interaction) => {
        interaction.deferUpdate();
        const queue = useQueue(interaction.guild.id);
        if (!queue) return;
        await queue.node.skip()
    }
}