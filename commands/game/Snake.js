const {Snake} = require('discord-gamecord');
const {SlashCommandBuilder} = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snake')
        .setDescription('Game Snake'),

        execute: async(interaction) => {
        const { Snake } = require('discord-gamecord');

    const Game = new Snake({
    message: interaction,
    isSlashGame: true,
    embed: {
        title: 'Snake Game',
        overTitle: 'Game Over',
        color: '#5865F2'
    },
    emojis: {
        board: '⬛',
        food: '🍎',
        up: '⬆️', 
        down: '⬇️',
        left: '⬅️',
        right: '➡️',
    },
    snake: { head: '🟢', body: '🟩', tail: '🟢', skull: '💀' },
    foods: ['🍎', '🍇', '🍊', '🫐', '🥕', '🥝', '🌽'],
    stopButton: 'Stop',
    timeoutTime: 60000,
    playerOnlyMessage: 'Chỉ {player} có thể sử dụng nút.'
    });

    Game.startGame();
    Game.on('gameOver', result => {
        return;
    //console.log(result);  // =>  { result... }
    });
    }
}
