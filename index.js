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

const commands = 'commands';

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
    authentication: '' 
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
client.commands = new Collection();
client.functions = new Collection();
client.commands = new Collection();

new CommandHandler({
  client,
  // commandsPath: path.join(__dirname, 'commands'),
  eventsPath: path.join(__dirname, 'events'),
  //validationsPath: path.join(__dirname, 'validations'),
});


// Load functions
const loadCommands = (dir) => {
  const commandsPath = path.join(__dirname, dir);
  const folders = fs.readdirSync(commandsPath);

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
      } else {
        console.warn(`[Cảnh Báo] The command at ${filePath} is missing a required "data" or "run" property.`);
      }
    }
  }
};

loadCommands(commands)

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

const loadContext = (dir) => {
  const contextPath = path.join(__dirname, dir);
  const files = fs.readdirSync(contextPath).filter(file => file.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(contextPath, file);
    const context = require(filePath);

    if (context.data && context.execute) {
      client.commands.set(context.data.name, context);
    } else {
      console.warn(`[WARNING] The command in ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
};

loadContext('context');


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
        return;
      }

      if (interaction.replied || interaction.deferred) {
        console.warn('Tương tác đã được trả lời hoặc hoãn.');
        return;
      }

      await command.execute(interaction);
    } else if (!interaction.isCommand() && !interaction.isContextMenuCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      return await interaction.reply({ content: 'Lệnh không tìm thấy!', ephemeral: true });
    }

    if (interaction.replied || interaction.deferred) {
      console.warn('Tương tác đã được trả lời hoặc hoãn.');
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Lỗi khi thực thi lệnh:', error);
      await interaction.reply({ content: 'Có lỗi xảy ra khi thực thi lệnh.', ephemeral: true });
    }
  } catch (error) {
    console.log(
      chalk.blue.bgRed.bold('[LỖI] :') +
      (error)
    );
    const response = { content: 'Có lỗi xảy ra.', ephemeral: true };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(response).catch(err => console.error('Lỗi khi gửi followUp:', err));
    } else {
      await interaction.reply(response).catch(err => console.error('Lỗi khi gửi reply:', err));
    }
  }
});


client.login(process.env.TOKEN);
