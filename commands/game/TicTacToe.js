const {TicTacToe} = require('discord-gamecord');
const {SlashCommandBuilder} = require('discord.js')

module.exports = {
    data : new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('Game Tic Tac Toe')
    .addMentionableOption(option => 
        option
        .setName('player')
        .setDescription('Người bạn muốn chơi cùng!')
        .setRequired(true)
    ),


    run: async({interaction}) => {
        const Game = new TicTacToe({
            message: interaction,
            isSlashGame: true,
            opponent: interaction.options.getMentionable('player'),
            //opponent: interaction.message.mentions.users.first(),
            embed: {
              title: 'Tic Tac Toe',
              color: '#5865F2',
              statusTitle: 'Status',
              overTitle: 'Game Over'
            },
            emojis: {
              xButton: '❌',
              oButton: '🔵',
              blankButton: '➖'
            },
            mentionUser: true,
            timeoutTime: 60000,
            xButtonStyle: 'DANGER',
            oButtonStyle: 'PRIMARY',
            turnMessage: '{emoji} | Đến lượt của: **{player}**.',
            winMessage: '{emoji} | Chúc mừng **{player}** là người chiến thắng .',
            tieMessage: 'Ván đấu hòa! Không ai thắng trong game này!',
            timeoutMessage: 'Ván đấu không được hoàn thành! Không ai chiến thắng ván đấu này!',
            playerOnlyMessage: 'Chỉ {player} và {opponent} có thể sử dụng nút.'
          });
          
          Game.startGame();
          Game.on('gameOver', result => {
            console.log(result);  // =>  { result... }
          });
    }
}