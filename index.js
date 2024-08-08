require('dotenv').config();
const { Player } = require('discord-player');
const { Client, GatewayIntentBits, Collection, BaseInteraction} = require('discord.js');
const { CommandHandler } = require('djs-commander');
const { YoutubeiExtractor } = require("discord-player-youtubei");
const path = require('path');
const welcome = require('./untils/welcome');
const goodbye = require('./untils/goodbye');
const welcomeSchema = require('./mongoDB/welcome');
const goodbyeSchema = require('./mongoDB/goodbye');
const fs = require('fs')

/**
 * @param {BaseInteraction} interaction
 */


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
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

player.extractors.loadDefault();

//player.extractors.register(YoutubeiExtractor, {
//  authentication: process.env.YOUTUBE_TOKEN || "ya29.a0AcM612z4-ULJHrMeztQWLXkVJ0aD9eVp-qPu4whTuUA3Q079BaFNxvZCCdhTX_v0eE-1i2H2LWlVpZyH36t3mjl_imqHenj9c7155oKNbgxNSiqXdEIyQhEiEVaV6kvUDje5v092J7VCLho8rbvE4XW6tdFU5aoRrsxWD1C5vQNsqHRWaCgYKAcUSARISFQHGX2MieXMJcHBobhPFG5eV0-o0ow0183",
//});
player.setMaxListeners(100);

client.player = player;

client.functions = new Collection()
client.context = new Collection()
client.commands = new Collection()

new CommandHandler({
  client,
  commandsPath: path.join(__dirname, 'commands'),
  eventsPath: path.join(__dirname, 'events'),
  validationsPath: path.join(__dirname, 'validations'),
  //testServer: 'TEST_SERVER_ID',
});


client.on("guildMemberAdd", async (member) => {
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
    console.error("Lỗi khi xử lý sự kiện guildMemberAdd:", error);
  }
});

client.on("guildMemberRemove", async (member) => {
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
    console.error("Lỗi khi xử lý sự kiện guildMemberRemove:", error);
  }
});

// Load functions
const functionsPath = path.join(__dirname, 'functions');
const functionsFolders = fs.readdirSync(functionsPath);

for (const folder of functionsFolders) {
  const functionsfilePath = path.join(functionsPath, folder);
  const functionsFiles = fs.readdirSync(functionsfilePath).filter(file => file.endsWith('.js'));
  for (const file of functionsFiles) {
    const filePath = path.join(functionsfilePath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      client.functions.set(command.data.name, command);
  } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}
}

// // Load commands
// const commandsPath = path.join(__dirname, 'commands');
// const commandsFolders = fs.readdirSync(commandsPath);

// for (const folder of commandsFolders) {
//   const commandsfilePath = path.join(commandsPath, folder);
//   const commandsFiles = fs.readdirSync(commandsfilePath).filter(file => file.endsWith('.js'));
//   for (const file of commandsFiles) {
//     const filePath = path.join(commandsfilePath, file);
//     const command = require(filePath);

//     if ('data' in command && 'run' in command) {
//       client.commands.set(command.data.name, command);
//   } else {
//       console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
//   }
// }
// }

//load player folder
const playerfolder = path.join(__dirname, 'player');
const playerfiles = fs.readdirSync(playerfolder).filter(file => file.endsWith('.js'));

for (const file of playerfiles) {
  const filePath = path.join(playerfolder, file);
  const event = require(filePath);
  
  if (event.name && event.execute) {
    player.events.on(event.name, (...args) => event.execute(client, ...args));
  } else {
    console.log(`[WARNING] Sự kiện trong ${filePath} thiếu thuộc tính "name" hoặc "execute".`);
  }
}

// //load context folder
// const contextfolder = path.join(__dirname, 'context');
// const contextfiles = fs.readdirSync(contextfolder).filter(file => file.endsWith('.js'));

// for (const file of contextfiles) {
//   const filePath = path.join(contextfolder, file);
//   const command = require(filePath);
  
//   if ('data' in command && 'run' in command) {
//     client.context.set(command.data.name, command);
// } else {
//     console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
// }
// }

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
      //Handling autocomplete requests
      const command = interaction.client.functions.get(interaction.commandName);

      if(!command) {
        return;
      }
    
      return command.execute(interaction)
  }

  if (interaction.isMessageComponent()) {
  
    const command = interaction.client.functions.get(interaction.customId);
    
    if (!command) {
        console.error(`Lệnh với customId ${interaction.customId} không được tìm thấy.`);
        return;
    }

    try {
        return command.execute(interaction);
    } catch (error) {
        console.error('Lỗi khi thực thi lệnh:', error);
        
        // Đảm bảo rằng tương tác đã được deferred hoặc replied
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp({
                content: 'Có lỗi xảy ra.',
                ephemeral: true
            }).catch(err => console.error('Lỗi khi gửi followUp:', err));
        } else {
            await interaction.reply({
                content: 'Có lỗi xảy ra.',
                ephemeral: true
            }).catch(err => console.error('Lỗi khi gửi reply:', err));
        }
    }
}


if (interaction.isModalSubmit()) {
  const command = interaction.client.functions.get(interaction.customId);
  if (!command) {
    console.log(`Không tìm thấy lệnh ${interaction.customId}.`);
    return;
  }

  try {
    // Ghi log trước khi gọi execute để kiểm tra trạng thái
    console.log('Thực thi lệnh:', command.name);
    await command.execute(interaction);
    // Ghi log sau khi gọi execute để đảm bảo nó không bị lỗi
    console.log('Thực thi lệnh thành công.');
  } catch (error) {
    console.error('Lỗi khi thực thi lệnh:', error);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: 'Có lỗi xảy ra.',
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: 'Có lỗi xảy ra.',
        ephemeral: true
      });
    }
  }
}

});
  //   await command.run(interaction);


// client.once('ready', async () => {
//   const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

//   try {
//     console.log('Started refreshing application (/) commands.');

//     const contextCommands = fs.readdirSync(contextfolder)
//       .filter(file => file.endsWith('.js'))
//       .map(file => require(path.join(contextfolder, file)).data.toJSON());

//     await rest.put(Routes.applicationCommands(client.user.id), {
//       body: contextCommands,
//     });
//   console.log('Successfully reloaded application (/) commands.');
// } catch (error) {
//     console.error(error);
// }
// })


client.login(process.env.TOKEN);
