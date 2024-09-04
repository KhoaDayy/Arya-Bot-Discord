const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const axios = require('axios');
const FormData = require('form-data');
const { createWriteStream, createReadStream } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('post')
        .setDescription('Đăng ảnh lên cơ sở dữ liệu qua API!')
        .addSubcommand(subcommand =>
            subcommand
                .setName("image")
                .setDescription("Tải ảnh lên API!")
                .addStringOption(option =>
                    option
                    .setName('char')
                    .setDescription('Chọn nhân vật cho ảnh upload')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Ayaka', value: 'ayaka' }
                    )
                )
                .addAttachmentOption(option =>
                    option
                        .setName('image')
                        .setDescription('Ảnh bạn muốn đăng')
                        .setRequired(true)
                )
        ),

    execute: async ( interaction ) => {
        await interaction.deferReply();

        const character = interaction.options.getString('char');
        const attachment = interaction.options.getAttachment('image');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return interaction.editReply({ content: 'Bạn không có quyền sử dụng lệnh này.', ephemeral: true });
        }

        try {
            // Tải ảnh từ URL đính kèm
            const response = await axios.get(attachment.url, { responseType: 'stream' });

            // Tạo một tệp tạm để lưu trữ ảnh
            const tempFilePath = join(tmpdir(), 'temp_image' + 1);
            const writeStream = createWriteStream(tempFilePath);
            response.data.pipe(writeStream);

            writeStream.on('finish', async () => {
                // Tạo FormData để upload ảnh
                const form = new FormData();
                form.append('file', createReadStream(tempFilePath));
                form.append('character', character);

                // Upload ảnh
                try {
                    const apiResponse = await axios.post(`https://random-image-api-b39c.onrender.com/random-image/${character}`, form, {
                        headers: {
                            ...form.getHeaders(),
                        }
                    });
                    console.log('Upload thành công!', apiResponse.data);
                    await interaction.editReply('Upload thành công!');
                } catch (uploadError) {
                    console.error('Lỗi khi upload ảnh:', uploadError);
                    await interaction.editReply('Đã xảy ra lỗi khi upload ảnh.');
                }
            });
        } catch (error) {
            console.error('Lỗi khi tải ảnh:', error);
            await interaction.editReply('Đã xảy ra lỗi khi xử lý ảnh.');
        }
    }
};
