const { SlashCommandBuilder } = require("discord.js");
const { checkUser } = require("../helper.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    let sender = checkUser(interaction.user.id);
    if (sender === "responder" || sender === "alerter")
      await interaction.reply("Pong!");
  },
};
