const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const level = require('../../mongoDB/level');
const { Font, RankCardBuilder  } = require("canvacord");
const caculateXP = require('../../untils/caculateXP');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Xem cấp độ')
        .addMentionableOption(option =>
            option  
                .setName('user')
                .setDescription('Chọn người muốn xem cấp độ')
                .setRequired(false)
        ),

    run: async ({interaction}) => {
        await interaction.deferReply();

        const mentionedUserID = interaction.options.get('user')?.value;
        const targetUserID = mentionedUserID || interaction.member.id;
        const targetUserObject = await interaction.guild.members.fetch(targetUserID);

        const fetchedLevel = await level.findOne({
            userID: targetUserID,
            guildID: interaction.guild.id

        });

        if (!fetchedLevel) {
            interaction.editReply(
                mentionedUserID
                 ? `${targetUserObject.user.tag} chưa có Level, hãy thử lại khi họ chat thêm một chút.ψ(._. )>`
                 : "Bạn chưa có Level, Hãy chat một chút rồi thử lại nha.（*゜ー゜*） "
            );
            return;
        }

        let allLevels = await level.find({ guildID: interaction.guild.id}).select('-_id userID level xp');

        allLevels.sort((a,b) => {
            if (a.level === b.level) {
                return b.xp - a.xp;
            } else {
                return b.level - a.level;
            }
        });

        let currentRank = allLevels.findIndex((lvl) => lvl.userID === targetUserID) + 1;

        Font.loadDefault();
        const status = targetUserObject.presence ? targetUserObject.presence.status : 'offline'; // Lấy trạng thái
        
        const rank = new RankCardBuilder()
            .setAvatar(targetUserObject.user.displayAvatarURL({ size: 256 }))
            .setRank(currentRank)
            .setLevel(fetchedLevel.level)
            .setCurrentXP(fetchedLevel.xp)
            .setRequiredXP(caculateXP(fetchedLevel.level))
            .setStatus(status)
            .setDisplayName(targetUserObject.user.displayName)
            .setUsername(targetUserObject.user.username)
            .setOverlay(90)
            .setBackground("#23272a")

        const data = await rank.build();
        const attact = new AttachmentBuilder(data);

        interaction.editReply({files: [attact]})
        },
}

