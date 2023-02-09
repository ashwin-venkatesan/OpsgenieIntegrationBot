const { SlashCommandBuilder } = require("discord.js");
const { checkUser, setMinDelay } = require("../helper.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("min")
    .setDescription("Sets the Minimum Delay before sending an Alert")
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("Value of delay in minutes")
        .setRequired(true)
    ),
  async execute(interaction) {
    const minutes = interaction.options.getInteger("minutes");
    let sender = checkUser(interaction.user.id);
    if (sender === "responder") {
      let response = setMinDelay(minutes);
      await interaction.reply({ content: response, ephemeral: true });
    } else
      await interaction.reply({
        content:
          "You do not have enough permissions for to modify Min Delay :(",
        ephemeral: true,
      });
  },
};
