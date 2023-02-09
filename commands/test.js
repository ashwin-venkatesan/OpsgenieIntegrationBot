const { SlashCommandBuilder } = require("discord.js");
const { checkUser, createAlert } = require("../helper.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription(
      "Creates a forced Alert to the responder. Please use wisely!"
    ),
  async execute(interaction) {
    let sender = checkUser(interaction.user.id);
    if (sender === "responder" || sender === "alerter") {
      createAlert(true);
      await interaction.reply("Alert Created Successfully!");
    } else
      await interaction.reply({
        content: "You do not have enough permissions to Create an Alert :(",
        ephemeral: true,
      });
  },
};
