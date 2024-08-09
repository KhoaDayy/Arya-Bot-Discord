require('dotenv').config();
const { Client, GatewayIntentBits, Collection, BaseInteraction } = require('discord.js');
const { Player } = require('discord-player');
const { CommandHandler } = require('djs-commander');
const path = require('path');
const fs = require('fs');
const welcome = require('./untils/welcome');
const goodbye = require('./untils/goodbye');
const welcomeSchema = require('./mongoDB/welcome');
const goodbyeSchema = require('./mongoDB/goodbye');

console.clear();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
});

const player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
});

player.extractors.loadDefault();
player.setMaxListeners(100);

client.player = player;
client.functions = new Collection();
client.context = new Collection();
client.commands = new Collection();
client.cooldowns = new Collection();

new CommandHandler({
  client,
  commandsPath: path.join(__dirname, 'commands'),
  eventsPath: path.join(__dirname, 'events'),
  validationsPath: path.join(__dirname, 'validations'),
});

// Load functions
const loadFunctions = (dir) => {
  const functionsPath = path.join(__dirname, dir);
  const folders = fs.readdirSync(functionsPath);

  for (const folder of folders) {
    const folderPath = path.join(functionsPath, folder);
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.functions.set(command.data.name, command);
      } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  }
};

loadFunctions('functions');

const loadEvents = (dir) => {
  const eventPath = path.join(__dirname, dir);
  const files = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(eventPath, file);
    const event = require(filePath);
    if (event.name && event.execute) {
      player.events.on(event.name, (...args) => event.execute(client, ...args));
    } else {
      console.warn(`[WARNING] The event in ${filePath} is missing a required "name" or "execute" property.`);
    }
  }
};

loadEvents('player');

client.on('guildMemberAdd', async (member) => {
  try {
    const guildID = member.guild.id;
    const existingSetup = await welcomeSchema.findOne({ guildID });
    if (!existingSetup) return;

    const embed = await welcome(member);
    const channel = member.guild.channels.cache.get(existingSetup.channelID);
    if (channel) {
      await channel.send({
        content: `<@${member.id}> Chào mừng đến với server!!`,
        embeds: [embed],
      });
    }
  } catch (error) {
    console.error('Lỗi khi xử lý sự kiện guildMemberAdd:', error);
  }
});

client.on('guildMemberRemove', async (member) => {
  try {
    const guildID = member.guild.id;
    const existingSetup = await goodbyeSchema.findOne({ guildID });
    if (!existingSetup) return;

    const embed = await goodbye(member);
    const channel = member.guild.channels.cache.get(existingSetup.channelID);
    if (channel) {
      await channel.send({
        content: `<@${member.id}> Tạm biệt, hẹn một ngày ta gặp lại.`,
        embeds: [embed],
      });
    }
  } catch (error) {
    console.error('Lỗi khi xử lý sự kiện guildMemberRemove:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isAutocomplete() || interaction.isMessageComponent() || interaction.isModalSubmit()) {
      const command = interaction.client.functions.get(interaction.customId || interaction.commandName);
      if (!command) {
        console.error(`Lệnh với ${interaction.customId || interaction.commandName} không được tìm thấy.`);
        return;
      }

      await command.execute(interaction);
    }
  } catch (error) {
    console.error('Lỗi khi thực thi lệnh:', error);
    const response = { content: 'Có lỗi xảy ra.', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(response).catch(err => console.error('Lỗi khi gửi followUp:', err));
    } else {
      await interaction.reply(response).catch(err => console.error('Lỗi khi gửi reply:', err));
    }
  }
});

client.login(process.env.TOKEN);
