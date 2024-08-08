// module.exports = {
//     name: 'playerStart',
//     execute: async (client, queue, track) => {
//         try {
//             const playerFunction = client.functions.get('player');
//             if (!playerFunction) {
//                 console.error('Không tìm thấy hàm player.');
//                 return;
//             }


            
//             const res = await playerFunction.execute(client, queue, track);
//             if (queue.metadata && queue.metadata.mess) {
//                 await queue.metadata.msg.edit(res);
               
//             }
//         } catch (error) {
//             console.error('Lỗi trong playerStart:', error);
//         }
//     }
// };

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