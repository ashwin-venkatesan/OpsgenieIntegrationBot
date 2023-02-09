const { SlashCommandBuilder } = require("discord.js");
const { checkUser, setLastActivityThreshold } = require("../helper.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("Sets the Threshold used to check AFK")
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("Value of threshold in minutes")
        .setRequired(true)
    ),
  async execute(interaction) {
    const minutes = interaction.options.getInteger("minutes");
    let sender = checkUser(interaction.user.id);
    if (sender === "responder") {
      let response = setLastActivityThreshold(minutes);
      await interaction.reply({ content: response, ephemeral: true });
    } else
      await interaction.reply({
        content:
          "You do not have enough permissions for to modify AFK Threshold :(",
        ephemeral: true,
      });
  },
};
