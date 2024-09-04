const { ContextMenuCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Tiktok = require('@tobyg74/tiktok-api-dl');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new ContextMenuCommandBuilder()
    .setName('RePlay')
    .setType(3), // Type 3 is for message context menus

  execute: async (interaction) => {
    await interaction.deferReply();

    // Ensure the interaction is handled only if the target message exists
    if (!interaction.targetMessage) {
      return interaction.editReply({ content: 'No message was targeted!', ephemeral: true });
    }

    const messageContent = interaction.targetMessage.content;

    try {
      // Use the TikTok API to download the video
      const result = await Tiktok.Downloader(messageContent, {
        version: "v3", // version: "v1" | "v2" | "v3"
      });

      if (result.status === 'success' && result.result && result.result.video1) {
        const videoUrl = result.result.video1;
        const outputPath = path.resolve(__dirname, 'downloaded_video.mp4');

        // Download and save the video
        await downloadVideo(videoUrl, outputPath);

        // Create an embed to send with the video
        const embed = new EmbedBuilder()
          .setAuthor({
            name: result.result.author.nickname,
            iconURL: result.result.author.avatar,
          })
          .setTitle(result.result.desc)
          .setColor('Random')
          .setTimestamp()
          

        // Create a file attachment
        const attachment = new AttachmentBuilder(outputPath, { name: 'tiktok_video.mp4' });

        // Send the embed first
        await interaction.editReply({ embeds: [embed] });

        // After sending the embed, send the video attachment in a new message
        await interaction.channel.send({ files: [attachment] });

        // Delete the video file after sending
        fs.unlinkSync(outputPath);
      } else {
        await interaction.editReply({ content: 'Failed to retrieve video information.' });
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      await interaction.editReply({ content: 'An error occurred while downloading the video.' });
    }
  }
};

// Helper function to download the video
async function downloadVideo(url, outputLocationPath) {
  const writer = fs.createWriteStream(outputLocationPath);

  const response = await axios.get(url, {
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}
