const {SlashCommandBuilder} = require('discord.js');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

module.exports = {
    deteted: true,
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Tạo Text-To-Speech')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription('Văn bản muốn chuyển')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('voice')
                .setDescription('Chọn mô hình âm thanh')

                .addChoices(
                    {
                        name: 'alloy',
                        value: 'alloy'
                    },
                    {
                        name: 'echo',
                        value: 'echo'
                    },
                    {
                        name: 'fable',
                        value: 'fable'
                    },
                    {
                        name: 'onyx',
                        value: 'onyx'
                    },                    
                    {
                        name: 'nova',
                        value: 'nova'
                    },                    
                    {
                        name: 'shimmer',
                        value: 'shimmer'
                    },
                )
        ),

    execute: async(interaction) => {
        const text = interaction.options.getString('text');
        const voice = interaction.options.getString('voice');
        const speechFile = path.resolve("./speech.mp3");

        const openai = new OpenAI();

        async function main() {
            const mp3 = await openai.audio.speech.create({
              model: "tts-1",
              voice: voice,
              input: "Today is a wonderful day to build something people love!",
            });
            const buffer = Buffer.from(await mp3.arrayBuffer());
            await fs.promises.writeFile(speechFile, buffer);
    }
    try {
        await main()
    } catch (error) {
        console.log(error)
    }
}
}