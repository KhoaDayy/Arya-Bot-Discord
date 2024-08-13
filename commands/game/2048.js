const { TwoZeroFourEight } = require('discord-gamecord');
const {SlashCommandBuilder} = require('discord.js')

/**
 * 
 * @param { CommandInteraction } interaction
 */


module.exports= {
    data : new SlashCommandBuilder()
    .setName('2048')
    .setDescription('Game 2048'),
    run: async({interaction, message}) => {
        const Game = new TwoZeroFourEight({
            message: interaction,
            isSlashGame: true,
            embed: {
              title: '2048',
              color: '#5865F2'
            },
            emojis: {
              up: '⬆️',
              down: '⬇️',
              left: '⬅️',
              right: '➡️',
            },
            timeoutTime: 60000,
            buttonStyle: 'PRIMARY',
            playerOnlyMessage: 'Chỉ {player} có thể dùng nút.'
          });
        
          Game.startGame();
          Game.on('gameOver', (result) => {
            interaction.reply(`Game over, Kết quả: ${result}`);
          });
    }
}