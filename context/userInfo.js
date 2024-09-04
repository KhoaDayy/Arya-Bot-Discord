const { ContextMenuCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('User Infor')
    .setType(2), // Type 2 là Context Menu Command

  async execute(interaction) {
    const user = interaction.targetUser;

    const embed = new EmbedBuilder()
      .setTitle('User Info')
      .setDescription(`User: ${user.tag}\nID: ${user.id}`)
      .setThumbnail(user.displayAvatarURL());

    await interaction.reply({ embeds: [embed] });
  },
};