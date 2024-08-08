const { useMainPlayer, useQueue } = require("discord-player");

const player = useMainPlayer();

// module.exports = {
//     data: {
//         name: "player_loop",
//         type: "button",
//     },

//     execute: async (client, interaction) => {
//         //interaction.deferUpdate();
//         // const queue = useQueue(interaction.guild.id);
//         // if (!queue) return;

//         // if (queue.repeatMode === 0) {
//         //     queue.setRepeatMode(1);
//         // }
//         // else if(queue.repeatMode === 1) {
//         //     queue.setRepeatMode(2);
//         // }
//         // else if(queue.repeatMode === 2) {
//         //     queue.setRepeatMode(0);
//         // }
//         // const player = client.functions.get('player');
//         // queue.metadata.mess.edit(player)
//     }
// }

module.exports = {
    data: {
        name: "player_loop",
        type: "button",
    },

    execute: async (client,interaction) => {
        await interaction.deferUpdate();
        const queue = useQueue(interaction.guild.id);
        console.log(queue)
        if (!queue) return;
        
        if (queue.repeatMode === 0) {
            queue.setRepeatMode(1);
        }
        else if(queue.repeatMode === 1) {
            queue.setRepeatMode(2);
        }
        else if(queue.repeatMode === 2) {
            queue.setRepeatMode(0);
        }
        const player = interaction.client.functions.get('player');
        queue.metadata.mess.edit(player)
    }
}