const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Replicate = require('replicate');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName("imagine")
        .setDescription("Tạo ảnh hoặc Upscale ảnh bằng AI.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("generate")
                .setDescription("Tạo ảnh bằng Ai")
                .addStringOption(option =>
                    option
                        .setName('prompt')
                        .setDescription('Mô tả nội dung của hình ảnh')
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName('model')
                        .setDescription('Chọn mô hình hình ảnh để sử dụng')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Stable Diffusion 3', value: 'stability-ai/stable-diffusion-3' },
                            { name: 'Waifu-Diffusion', value: 'cjwbw/waifu-diffusion:25d2f75ecda0c0bed34c806b7b70319a53a1bccad3ade1a7496524f013f48983' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("upscale")
                .setDescription("Upscale ảnh bằng Ai")
                .addAttachmentOption(option =>
                    option
                        .setName('image')
                        .setDescription('Image bạn muốn upscale')
                        .setRequired(true)
                )
            ),

    execute: async ( interaction ) => {
        try {
        // Hoãn phản hồi
        await interaction.deferReply();

        // Khởi tạo Replicate với API token từ biến môi trường
        const replicate = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });

        // Xác định subcommand được sử dụng
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "generate") {
            // Lấy thông tin từ người dùng
            const prompt = interaction.options.getString('prompt');
            const model = interaction.options.getString('model');

            let input;
            if (model === 'stability-ai/stable-diffusion-3'){
                // Cấu hình đầu vào cho model
                input = {
                    cfg: 3.5,
                    steps: 28,
                    prompt: prompt,
                    aspect_ratio: "16:9",
                    output_format: "png",
                    output_quality: 90,
                    negative_prompt: "",
                    prompt_strength: 0.85
                };
            } else if (model === 'cjwbw/waifu-diffusion:25d2f75ecda0c0bed34c806b7b70319a53a1bccad3ade1a7496524f013f48983') {
                // Cấu hình đầu vào cho model
                input = {
                    width: 512,
                    height: 512,
                    prompt: prompt,
                    num_outputs: 1,
                    guidance_scale: 7.5,
                    num_inference_steps: 50
                };
            }

            // Đợi cho việc tạo ảnh hoàn tất
            const output = await replicate.run(model, { input });

            // Xác nhận kiểu dữ liệu của output và trích xuất URL
            const imageUrl = Array.isArray(output) ? output[0] : output;

            // Kiểm tra sự tồn tại của imageUrl
            if (!imageUrl || typeof imageUrl !== 'string') {
                throw new Error('Không thể tạo ảnh. Vui lòng thử lại sau.');
            }

            // Tạo embed
            const embed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Tạo ảnh thành công')
                .setImage(imageUrl)
                .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Tạo nút tải xuống
            const button = new ButtonBuilder()
                .setLabel('Tải xuống')
                .setStyle('Link')
                .setURL(imageUrl);

            // Tạo hàng hành động với nút
            const row = new ActionRowBuilder()
                .addComponents(button);

            // Gửi phản hồi với embed và nút
            await interaction.editReply({ embeds: [embed], components: [row] });
            } else if (subcommand === "upscale") {
                // get input
                const attachment = interaction.options.getAttachment('image');
                const imageUrl = attachment.url;

                //config
                 const input = {
                     hdr: 0,
                     image: imageUrl,
                     steps: 8,
                     format: "png",
                     prompt: "anime girl, highres, close up, high quality, 8k, 4k, 8k quality, 4k quality, 8k quality, 4k quality",
                     scheduler: "DDIM",
                     tile_size: 768,
                     creativity: 0.4,
                     guess_mode: false,
                     resolution: 2560,
                     resemblance: 0.85,
                     guidance_scale: 0,
                     negative_prompt: "Teeth, tooth, open mouth, longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, mutant",
                     lora_details_strength: -0.25,
                     lora_sharpness_strength: 0.75
                 };



                const output = await replicate.run( "batouresearch/high-resolution-controlnet-tile:de76bd93ab9e72b0286c3428ed694fbb59b9b6c67206533ddbaafe8d195e749c"
                , { input });
                const imageUrl2 = Array.isArray(output) ? output[0] : output;
                
                // Tạo embed
                const embed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle('Tạo ảnh thành công')
                    .setImage(imageUrl2)  // Đảm bảo imageUrl là một chuỗi URL
                    .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                // Tạo nút tải xuống
                const button = new ButtonBuilder()
                    .setLabel('Tải xuống')
                    .setStyle('Link') // Sửa kiểu nút thành 'Link'
                    .setURL(imageUrl2); // URL của ảnh để tải xuống

                // Tạo hàng hành động với nút
                const row = new ActionRowBuilder()
                    .addComponents(button);

                // Gửi phản hồi với embed và nút
                await interaction.editReply({ embeds: [embed], components: [row] });
            }
        } catch (error) {
            console.error('Đã xảy ra lỗi:', error);
            // Xử lý lỗi và thông báo cho người dùng
            await interaction.editReply('Đã xảy ra lỗi khi tạo ảnh. Vui lòng thử lại sau.');
        }
    }
};
