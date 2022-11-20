require('dotenv').config();
const { Client, Events, GatewayIntentBits } = require('discord.js');
const client = new Client({
	'intents': [
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.Guilds,
  		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers
	]
});

const config = require('../config');
const { checkSender, createAlert, closeAlert } = require('./helpers');

client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.MessageCreate, async (msg) => {

	let channel = msg.channelId;
	let sender = checkSender(msg.author.id);
	let message = msg.content.trim();

	if(channel === config.closeAllAlertsChannelId) {
		if(sender === "responder" && message === ".") {
			closeAlert();
		}
		else if(sender === "responder" && message === "- . ... -") {
			createAlert();
		} 
	}
	else {
		switch(sender) {
			case "alerter":
				createAlert();
				break;
			case "responder":
				closeAlert();
				break;
		}
	}

});

console.log('Bot Starting...');
client.login(process.env.DISCORD_BOT_TOKEN);