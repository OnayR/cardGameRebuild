let deck = [
    ["red", 0], ["red", 1], ["red", 1], ["red", 2], ["red", 2], ["red", 3], ["red", 3], ["red", 4], ["red", 4], ["red", 5], ["red", 5], ["red", 6], ["red", 6], ["red", 7],
    ["red", 7], ["red", 8], ["red", 8], ["red", 9], ["red", 9], ["red", "skip"], ["red", "skip"], ["red", "reverse"], ["red", "reverse"], ["red", "draw2"], ["red", "draw2"],
    ["blue", 0], ["blue", 1], ["blue", 1], ["blue", 2], ["blue", 2], ["blue", 3], ["blue", 3], ["blue", 4], ["blue", 4], ["blue", 5], ["blue", 5], ["blue", 6], ["blue", 6], ["blue", 7],
    ["blue", 7], ["blue", 8], ["blue", 8], ["blue", 9], ["blue", 9], ["blue", "skip"], ["blue", "skip"], ["blue", "reverse"], ["blue", "reverse"], ["blue", "draw2"], ["blue", "draw2"],
    ["green", 0], ["green", 1], ["green", 1], ["green", 2], ["green", 2], ["green", 3], ["green", 3], ["green", 4], ["green", 4], ["green", 5], ["green", 5], ["green", 6], ["green", 6], ["green", 7],
    ["green", 7], ["green", 8], ["green", 8], ["green", 9], ["green", 9], ["green", "skip"], ["green", "skip"], ["green", "reverse"], ["green", "reverse"], ["green", "draw2"], ["green", "draw2"],
    ["yellow", 0], ["yellow", 1], ["yellow", 1], ["yellow", 2], ["yellow", 2], ["yellow", 3], ["yellow", 3], ["yellow", 4], ["yellow", 4], ["yellow", 5], ["yellow", 5], ["yellow", 6], ["yellow", 6], ["yellow", 7],
    ["yellow", 7], ["yellow", 8], ["yellow", 8], ["yellow", 9], ["yellow", 9], ["yellow", "skip"], ["yellow", "skip"], ["yellow", "reverse"], ["yellow", "reverse"], ["yellow", "draw2"], ["yellow", "draw2"],
    ["wild", "picker"], ["wild", "picker"], ["wild", "draw4"], ["wild", "draw4"], ["wild", "draw4"], ["wild", "draw4"]
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
