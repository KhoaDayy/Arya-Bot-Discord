require('dotenv/config');
const { REST, Routes } = require('discord.js');

const rest = new REST().setToken(process.env.TOKEN);

const registerSlashCommands = async (client) => {
  // Chuyển đổi lệnh thành định dạng JSON
  const commands = client.commands.map(cmd => cmd.data.toJSON());

  try {
    console.log('Đang làm mới [/] Slash Command và Context Commands');

    // Gửi yêu cầu PUT tới Discord API
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`Làm mới thành công | Hiện đang có ${data.length}  lệnh [/] Slash Command và Context Commands`);
    return data;
  } catch (error) {
    console.error('Đã xảy ra lỗi: ' + error);
  }
};

module.exports = async (client) => {
  await registerSlashCommands(client);
};
