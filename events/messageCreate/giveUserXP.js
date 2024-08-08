const {Message } = require('discord.js');
const Level = require('../../mongoDB/level');
const caculateXP = require('../../untils/caculateXP');
const cooldowns = new Set();

function getRandomXP(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 
 * @param {Message} message 
 */
module.exports = async (message) => {
    if (!message.guild || message.author.bot || cooldowns.has(message.author.id)) return;

    const xpToGive = getRandomXP(5, 15);

    const query = {
        userID: message.author.id,
        guildID: message.guild.id,
    };

    try {

        const level = await Level.findOne(query);

        if (level) {
            level.xp += xpToGive;

            if (level.xp >= caculateXP(level.level)) {
                level.xp = 0;
                level.level += 1;

                message.channel.send(`Chúc mừng ${message.member} đã đạt cấp độ ${level.level}!`);
            }

            await level.save().catch((e) => {
                console.log('Lỗi khi cập nhật level:', e);
                return;
            });
            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 60000);
        } else {

            const newLevel = new Level({
                userID: message.author.id,
                guildID: message.guild.id,
                xp: xpToGive,
            });

            await newLevel.save();
            cooldowns.add(message.author.id);
            setTimeout(() => {
                cooldowns.delete(message.author.id);
            }, 60000);
        }
        
    } catch (error) {
        console.log('Lỗi khi trao XP:', error);
    }
};
