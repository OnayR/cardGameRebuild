let deck = [
  ["hart", "-", "aas"],
  ["hart", "-", "2"],
  ["hart", "-", "3"],
  ["hart", "-", "4"],
  ["hart", "-", "5"],
  ["hart", "-", "6"],
  ["hart", "-", "7"],
  ["hart", "-", "8"],
  ["hart", "-", "9"],
  ["hart", "-", "10"],
  ["hart", "-", "boer"],
  ["hart", "-", "vrouw"],
  ["hart", "-", "heer"],
  ["ruiten", "-", "aas"],
  ["ruiten", "-", "2"],
  ["ruiten", "-", "3"],
  ["ruiten", "-", "4"],
  ["ruiten", "-", "5"],
  ["ruiten", "-", "6"],
  ["ruiten", "-", "7"],
  ["ruiten", "-", "8"],
  ["ruiten", "-", "9"],
  ["ruiten", "-", "10"],
  ["ruiten", "-", "boer"],
  ["ruiten", "-", "vrouw"],
  ["ruiten", "-", "heer"],
  ["klaver", "-", "aas"],
  ["klaver", "-", "2"],
  ["klaver", "-", "3"],
  ["klaver", "-", "4"],
  ["klaver", "-", "5"],
  ["klaver", "-", "6"],
  ["klaver", "-", "7"],
  ["klaver", "-", "8"],
  ["klaver", "-", "9"],
  ["klaver", "-", "10"],
  ["klaver", "-", "boer"],
  ["klaver", "-", "vrouw"],
  ["klaver", "-", "heer"],
  ["schoppen", "-", "aas"],
  ["schoppen", "-", "2"],
  ["schoppen", "-", "3"],
  ["schoppen", "-", "4"],
  ["schoppen", "-", "5"],
  ["schoppen", "-", "6"],
  ["schoppen", "-", "7"],
  ["schoppen", "-", "8"],
  ["schoppen", "-", "9"],
  ["schoppen", "-", "10"],
  ["schoppen", "-", "boer"],
  ["schoppen", "-", "vrouw"],
  ["schoppen", "-", "heer"],
  ["joker", "-", "1"],
  ["joker", "-", "2"],
];

const {
  ActionRowBuilder,
  SlashCommandBuilder,
  ButtonBuilder,
  EmbedBuilder,
} = require("@discordjs/builders");
const { ComponentType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("game")
    .setDescription("Start a game of Uno")
    .addSubcommand((subcommand) =>
      subcommand.setName("help").setDescription("Get help with the game")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("start").setDescription("Start a new game of Uno")
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === "help") {
      const embed = new EmbedBuilder()
        .setTitle("Game Help")
        .setDescription(
          "To start the game, run the command `/game start`\n\nTo place a card, use the 'view deck' button to view your deck and place a card"
        )
        .setColor(0xe2725b);

      await interaction.reply({ embeds: [embed] });
    } else if (interaction.options.getSubcommand() === "start") {
      const embed = new EmbedBuilder()
        .setTitle("Game Started")
        .setDescription("The game has started")
        .setColor(0xe2725b);

      await interaction.reply({ embeds: [embed] });
    }
  },
};
