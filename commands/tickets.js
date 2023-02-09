const { SlashCommandBuilder } = require("discord.js");
const { checkUser, addDNDTickets } = require("../helper.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tickets")
    .setDescription("Add DND Tickets")
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Value of tickets to add")
        .setRequired(true)
    ),
  async execute(interaction) {
    const count = interaction.options.getInteger("count");
    let sender = checkUser(interaction.user.id);
    if (sender === "responder") {
      let response = addDNDTickets(count);
      await interaction.reply({ content: response, ephemeral: true });
    } else
      await interaction.reply({
        content:
          "You do not have enough permissions for to modify DND Threshold :(",
        ephemeral: true,
      });
  },
};
