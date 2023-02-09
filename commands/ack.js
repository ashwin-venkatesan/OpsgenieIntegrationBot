const { SlashCommandBuilder } = require("discord.js");
const { checkUser, closeAlert } = require("../helper.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ack")
    .setDescription("Acknowledges and closes all Alerts"),
  async execute(interaction) {
    let sender = checkUser(interaction.user.id);
    if (sender === "responder") {
      closeAlert(true);
      await interaction.reply({ content: "Alert Closed!", ephemeral: true });
    } else
      await interaction.reply({
        content:
          "You do not have enough permissions for to Acknowledge and Close an Alert :(",
        ephemeral: true,
      });
  },
};
