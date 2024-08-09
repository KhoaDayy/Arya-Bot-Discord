const { useQueue } = require("discord-player");
const { StringSelectMenuInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports.data = {
    name: "player_SelectionFunc",
    type: "SelectMenu",
}
async function Update_Player (client, queue)  {
   const player = client.functions.get('player');
   if (!player) return;
   const res = await player.execute(client, queue)
   queue.metadata.mess.edit(res)
}
/**
 * @param { StringSelectMenuInteraction } interaction
 */
module.exports.execute = async (interaction) => {
   const {guild, client, values} =interaction 
   const query = interaction.values?.at(0)
   const queue = useQueue(guild.id)

   if (query == "search") {
      const modal = new ModalBuilder()
      .setTitle('Search')
      .setCustomId('search-modal')
      .addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('search-input')
            .setLabel('Search for a song')
            .setStyle(TextInputStyle.Short)
        )
      );
    
    await interaction.showModal(modal);
    return;
   }
   interaction.deferUpdate().catch(e => console.error);
   if(!queue) return;
   switch (query) {   
      case 'loop':{
         const repeatMode = queue.repeatMode === 0? 1:
            queue.repeatMode === 1? 2:
               queue.repeatMode === 2? 3: 0
         queue.setRepeatMode(repeatMode)

         await Update_Player (client, queue)
         return;
      }
      case 'queue': {
         return;
      }
      case 'autoplay':{
            queue.setRepeatMode(queue.repeatMode === 3 ? 0 : 3)

            await Update_Player (client, queue)
         return;
      }
      case 'mute': {
         queue.node.setVolume(0)
         await Update_Player (client, queue);
         return;
      }
      case 'volumeinc':{
         const currentVolume = queue.node.volume
         const vol =Math.min(currentVolume + 10, 100)
         queue.node.setVolume(vol)
         await Update_Player (client, queue);
         return;
      }

      case 'volumedec':{
         const currentVolume = queue.node.volume
         const vol =Math.max(currentVolume - 10, 0)
         queue.node.setVolume(vol)
         await Update_Player (client, queue);
         return;
      }

      case 'lyrics':{
         return;
      }

      case 'shuffle':{
         queue.shuffle()
         await Update_Player (client, queue);
         return;
      }
}
}
