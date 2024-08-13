module.exports = {
     name: 'playerStart',
     execute: async (client, queue, track) => {
        const player = client.functions.get('player');

        if (!player) return;

        const res = await player.execute(client, queue, track);

        if (queue.metadata.mess)
            return queue.metadata.mess.edit(res)
     }
}