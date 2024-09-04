const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getavt')
        .setDescription('Lấy ảnh đại diện của ai đó.')
        .addMentionableOption(option =>
            option
                .setName('user')
                .setDescription('Chọn người bạn muốn lấy ảnh đại diện.')
                .setRequired(false)
        ),

     execute: (interaction) => {
            const user = interaction.options.getUser("user") || interaction.user;
           // let avtimg = ("https://cdn.discordapp.com/avatars/" + user.id + "/" + user.avatar + ".png?size=1024");
          //  interaction.reply(avtimg);
            interaction.reply(user.displayAvatarURL({ size: 1024 }));
            return
      }
};
