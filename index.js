require('dotenv').config();
const { Client, GatewayIntentBits, Collection, BaseInteraction } = require('discord.js');
const { Player } = require('discord-player');
const { CommandHandler } = require('djs-commander');
const path = require('path');
const fs = require('fs');
const welcome = require('./utility/welcome');
const goodbye = require('./utility/goodbye');
const welcomeSchema = require('./mongoDB/welcome');
const goodbyeSchema = require('./mongoDB/goodbye');
const express = require('express')
const chalk = require('chalk');
const chalkercli = require("chalkercli");
const CFonts = require('cfonts');
const { YoutubeiExtractor } = require('discord-player-youtubei');
const { env } = require('process');

const app = express()
const port = process.env.PORT || 8080;
const host = '0.0.0.0';
console.clear();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './utility/index.html'));
});

app.listen(port, host);
CFonts.say('Arya Bot', {
  font: 'block',
    align: 'center',
gradient: ['red', 'magenta']
  })
CFonts.say(`Bot Created By Kynx`, {
		font: 'console',
		align: 'center',
		gradient: ['red', 'magenta']
		})
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
console.log('Server started at http://localhost:' + port);
const player = new Player(client, {
  ytdlOptions: {
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
  },
});

player.extractors.loadDefault();

try {
  player.extractors.register(YoutubeiExtractor, {
    authentication: 'access_token=ya29.a0AcM612we54P2okKnD6ur1c3-jz8ALD-nhDaJjg9b5TDRyR9E5HWv_wh0eO7srGeUJ4MOk7Ymx0I2OrRPN4TOYY9zvqigysfFambFMbTH7Paz93UyuFmj9q3-vDWUOop22jMZk8SXH-PmgCZt8yD5rrXqt4BhXsRcRjiDyzGzrEhE-LPlaCgYKARQSARASFQHGX2MisxMRubYTiMullwjohAHZmw0183; refresh_token=1//0eFzKEtERhrwDCgYIARAAGA4SNwF-L9Ir_q7UI5b5tWvAuYT8i1lx_OjYg3PzEWx8fT6GJ1_J7c4iGsECSmedrAVYFUx8wa0hbHo; scope=https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube-paid-content; token_type=Bearer; expiry_date=2024-08-10T11:14:41.079Z' 
  });
  
  
} catch (error) {
  console.log(
    chalk.white.bgRed.bold('[LỖI] :') +
    (error)
  )
}

// player.extractors.loadDefault();
player.setMaxListeners(100);

client.player = player;
client.functions = new Collection();
client.commands = new Collection();


new CommandHandler({
  client,
  commandsPath: path.join(__dirname, 'commands'),
  eventsPath: path.join(__dirname, 'events'),
  //validationsPath: path.join(__dirname, 'validations'),
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
        console.warn(`[Cảnh Báo] The command at ${filePath} is missing a required "data" or "execute" property.`);
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
    console.log(
      chalk.blue.bgRed.bold('[LỖI] :') +
      (error)
    )
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
    console.log(
      chalk.blue.bgRed.bold('[LỖI] :') +
      (error)
    )
  }
});

client.on('interactionCreate', async (interaction) => {
  try {
    
    if (interaction.isAutocomplete() || interaction.isMessageComponent() || interaction.isModalSubmit()) {
      const command = interaction.client.functions.get(interaction.customId || interaction.commandName);
      if (!command) {
        //console.error(`Lệnh với ${interaction.customId || interaction.commandName} không được tìm thấy.`);
        return;
      }

      await command.execute(interaction);
    }
  } catch (error) {
    console.log(
      chalk.blue.bgRed.bold('[LỖI] :') +
      (error)
    )
    const response = { content: 'Có lỗi xảy ra.', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(response).catch(err => console.error('Lỗi khi gửi followUp:', err));
    } else {
      await interaction.reply(response).catch(err => console.error('Lỗi khi gửi reply:', err));
    }
  }
});

client.login(process.env.TOKEN);
