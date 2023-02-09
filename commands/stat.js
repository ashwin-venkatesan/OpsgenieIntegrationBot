const { SlashCommandBuilder } = require("discord.js");
const { checkUser, getCurrentStat } = require("../helper.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stat")
    .setDescription("Retrieves the current statistics used to create Alerts"),
  async execute(interaction) {
    let sender = checkUser(interaction.user.id);
    if (sender === "responder" || sender === "alerter") {
      let response = getCurrentStat();
      await interaction.reply(response);
    } else
      await interaction.reply({
        content: "You do not have enough permissions for to view Statistics :(",
        ephemeral: true,
      });
  },
};
