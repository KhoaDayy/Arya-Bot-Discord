const { SlashCommandBuilder } = require('discord.js');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yt-replay')
        .setDescription('Gửi video từ link YouTube vào kênh văn bản')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Link YouTube hoặc từ khóa tìm kiếm.')
                .setRequired(true)),

    execute: async ( interaction, client ) => {
        await interaction.deferReply();
        const query = interaction.options.getString('query');
        const tempVideoPath = path.join(__dirname, 'temp_video.mp4');
        const tempAudioPath = path.join(__dirname, 'temp_audio.mp3');
        const outputPath = path.join(__dirname, 'output_video.mp4');

        try {
            // Tải video và audio
            const videoStream = ytdl(query, { filter: 'videoonly', quality: 'highestvideo' });
            const audioStream = ytdl(query, { filter: 'audioonly', quality: 'highestaudio' });

            // Lưu video và audio vào các tệp tạm
            videoStream.pipe(fs.createWriteStream(tempVideoPath));
            audioStream.pipe(fs.createWriteStream(tempAudioPath));

            // Khi tải xong audio, ghép video và audio lại
            audioStream.on('end', () => {
                execFile(ffmpegPath, [
                    '-i', tempVideoPath,
                    '-i', tempAudioPath,
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-strict', 'experimental',
                    outputPath
                ], (error) => {
                    if (error) {
                        console.error(`Error merging video and audio: ${error.message}`);
                        return interaction.reply('Đã xảy ra lỗi trong quá trình xử lý video.');
                    }

                    // Gửi video vào kênh văn bản
                    interaction.reply({
                        files: [outputPath]
                    })
                    .then(() => {
                        // Xóa các tệp tạm sau khi gửi thành công
                        fs.unlinkSync(tempVideoPath);
                        fs.unlinkSync(tempAudioPath);
                        fs.unlinkSync(outputPath);
                    })
                    .catch(err => {
                        console.error(`Error sending video: ${err.message}`);
                        interaction.editReply('Đã xảy ra lỗi khi gửi video.');
                    });
                });
            });
        } catch (error) {
            console.error(error);
            interaction.reply('Đã xảy ra lỗi khi tải video.');
        }
    }
};
