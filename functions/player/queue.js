const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require("discord.js");
const { useMainPlayer } = require("discord-player");
const AryaIcons = require("./../../utility/icon");
const config = require("../../config");
const { Worker } = require('worker_threads');

const player = useMainPlayer();

async function buildImageInWorker(searchPlayer, query) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./utility/worker.js', {
            workerData: { searchPlayer, query }
        });

        worker.on('message', (arrayBuffer) => {
            console.log('Received data from worker');
            const buffer = Buffer.from(arrayBuffer);
            if (!Buffer.isBuffer(buffer)) {
                console.error('Type of received data:', typeof buffer);
                reject(new Error('Received data is not a buffer'));
            } else {
                const attachment = new AttachmentBuilder(buffer, { name: 'queue.png' });
                resolve(attachment);
            }
            worker.postMessage('terminate');
        });

        worker.on('error', (error) => {
            console.error('Worker error:', error);
            reject(error);
            worker.postMessage('terminate');
        });

        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

module.exports = {
    data: {
        name: "queue",
        type: "player",
    },

    execute: async (interaction, queue, Nextpage = true) => {
        if (!queue) return interaction.reply({ content: "There is no music playing in this server" });

        await interaction.deferReply();
        const fieldName = interaction?.message?.embeds?.at(0)?.data?.fields?.at(0);
        const mainRequire = fieldName?.value?.includes("﹏");
        const pageData = fieldName?.name?.replace("Page:", " ").trim().split("/");
        const queuetrack = [];
        let code = { content: "" };

        queue.tracks.forEach((track, i) => {
            queuetrack.push({
                title: track?.title,
                url: track?.url,
                duration: track?.duration,
                thumbnail: track?.thumbnail
            });
        });


        if (!queuetrack.length) {
            if (!mainRequire) {
                await interaction?.deleteReply().catch(console.error);
                return interaction.message.delete().catch(console.error);
            }
            return interaction.editReply({ content: "There is no music playing in this server" });
        }

        let page = eval(pageData?.at(0) || 1);
        const totalPage = Math.ceil(queuetrack.length / 20);
        if (!mainRequire) {
            if (Nextpage) {
                page = (page % totalPage) + 1;
            } else {
                page = (page - 1) < 1 ? totalPage : (page - 1);
            }
        }

        const currentIndex = (page - 1) * 20;
        let now = page * 20 - 20;
        const currentTrack = queuetrack.slice(currentIndex, currentIndex + 20);
        if (!currentTrack.length) return;

        if (config?.ImageSearch) {
            const searchPlayer = currentTrack.map((track, i) => ({
                index: ++now,
                avatar: track?.thumbnail ?? "https://i.imgur.com/vhcoFZo_d.webp",
                displayName: track.title.slice(0, currentTrack.length > 1 ? 30 : 80),
                time: track.duration,
            }));

            try {
                const attachment = await buildImageInWorker(searchPlayer, `Queue of ${interaction.guild.name}`);
                const embed = new EmbedBuilder()
                    .setTitle(`${AryaIcons.queue} Queue of ${interaction.guild.name}`)
                    .setColor("Random")
                    .addFields({ name: `Page: ${page} / ${totalPage}`, value: " " })
                    .setImage("attachment://queue.png");
                code.embeds = [embed];
                code.files = [attachment];
            } catch (error) {
                console.error('Error building image:', error);
                const embed = new EmbedBuilder()
                    .setTitle(`${AryaIcons.queue} Queue of ${interaction.guild.name}`)
                    .setColor("Random")
                    .addFields({ name: `Page: ${page} / ${totalPage}`, value: " " })
                    .setDescription(`${currentTrack.map((track) => `${++now} | **${`${track?.title}`.slice(0, 25)}** - [${track.duration}](${track.url})`).join("\n")}`);
                code.embeds = [embed];
            }
        } else {
            const embed = new EmbedBuilder()
                .setTitle(`${AryaIcons.queue} Queue of ${interaction.guild.name}`)
                .setColor("Random")
                .addFields({ name: `Page: ${page} / ${totalPage}`, value: " " })
                .setDescription(`${currentTrack.map((track) => `${++now} | **${`${track?.title}`.slice(0, 25)}** - [${track.duration}](${track.url})`).join("\n")}`);
            code.embeds = [embed];
        }

        const queueFund = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("queue_clear")
                .setLabel("Clear All")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("queue_del")
                .setEmoji("🗑️")
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("queue_Shuffle")
                .setEmoji(AryaIcons.shuffle)
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId("cancel")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Secondary),
        );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("queue_Page")
                .setLabel(`Page: ${page}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId("queue_prev")
                .setStyle(ButtonStyle.Secondary)
                .setLabel("◀"),
            new ButtonBuilder()
                .setCustomId("queue_refresh")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji(AryaIcons.refesh),
            new ButtonBuilder()
                .setCustomId("queue_next")
                .setStyle(ButtonStyle.Secondary)
                .setLabel("▶")
        );

        code.components = [queueFund, row];

        if (mainRequire) {
            return interaction.editReply(code);
        }

        interaction.deleteReply().catch(console.error);
        interaction.message.edit(code);
    }
};