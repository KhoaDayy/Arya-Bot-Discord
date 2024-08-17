const infoseverSchema = require('../../mongoDB/info');

module.exports = async (client) => {
    // Retrieve all guild info from the database
    const infosevers = await infoseverSchema.find();
    if (!infosevers || infosevers.length === 0) {
        console.error('Không có guild nào trong database.');
        return;
    }

    const updateChannel = (guild, infosever) => {
        const totalChannel = guild.channels.cache.get(infosever.countID.TotalID);
        const memberChannel = guild.channels.cache.get(infosever.countID.MemberID);
        const botChannel = guild.channels.cache.get(infosever.countID.BotID);

        if (totalChannel) totalChannel.setName(`👥・Tổng Member: ${infosever.count.Total}`);
        if (memberChannel) memberChannel.setName(` 👤・Members: ${infosever.count.Member}`);
        if (botChannel) botChannel.setName(`🤖・Bot : ${infosever.count.Bot}`);
    };

    client.on('guildMemberAdd', member => {
        const infosever = infosevers.find(g => g.guildID === member.guild.id);
        if (infosever) updateChannel(member.guild, infosever);
    });

    client.on('guildMemberRemove', member => {
        const infosever = infosevers.find(g => g.guildID === member.guild.id);
        if (infosever) updateChannel(member.guild, infosever);
    });

    // Iterate over each guild in the database and update channels when the bot starts
    infosevers.forEach(infosever => {
        const guild = client.guilds.cache.get(infosever.guildID);
        if (guild) updateChannel(guild, infosever);
    });
};
