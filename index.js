require("dotenv").config();
const { Client, Events, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
});
const fs = require("fs");
const path = require("path");

const config = require("./config");
const {
  checkUser,
  createAlert,
  closeAlert,
  updateLastActivity,
  skipAlert
} = require("./helper.js");
require('./deploy-commands.js');

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    console.log(
      `[INFO] The command ${command.data.name} is successfully set`
    );
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
});

client.on(Events.MessageCreate, async (msg) => {
  let channel = msg.channelId;
  let sender = checkUser(msg.author.id);

  if (!(channel in config.botChannelIds)) {
    switch (sender) {
      case "alerter":
        createAlert();
        break;
      case "responder":
        updateLastActivity();
        closeAlert();
        break;
    }
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  let channel = reaction.message.channelId;
  let messageAuthor = checkUser(reaction.message.author.id);
  let reactor = checkUser(user.id);
  let emoji = reaction.emoji.name;

  if (!(channel in config.botChannelIds)) {
    if(messageAuthor === 'alerter' && reactor === 'responder') {
      updateLastActivity();
      closeAlert();
    }
    if(messageAuthor === 'alerter' && reactor === 'alerter' && emoji === '3khoonmaaf') {
      skipAlert();
    }
  }
});

console.log("Bot Starting...");
client.login(process.env.DISCORD_BOT_TOKEN);
