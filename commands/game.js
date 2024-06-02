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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("end")
        .setDescription("End the current game of Uno")
        .addStringOption((option) =>
          option.setName("game_id").setDescription("The ID of the game to end").setRequired(true)
        )
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
      const gameId = client.currentGames.size + 1;
      client.currentGames.set('currentGames', []);
      let gameData = {
        gameId: gameId,
        users: [],
        deck: deck,
        currentDeck: [],
        currentCard: [],
        currentPlayer: 0,
        direction: 1,
        gameStarted: false,
        gameEnded: false,
      };

      // create a button to join the game
      const button = new ButtonBuilder()
        .setLabel("Join Game")
        .setStyle("Primary")
        .setCustomId("join_game");

      const row = new ActionRowBuilder().addComponents(button);

      // create an embed to display the game
      const embed = new EmbedBuilder()
        .setTitle("Game was started!")
        .setAuthor({
          name: `Started by ${interaction.user.username}`,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setDescription("Click the button to join the game!")
        .setColor(0xe2725b);

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });

      // create a collector to listen for button clicks
      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 5000,
      });

      // when a button is clicked add the user to the game
      collector.on("collect", async (button) => {
        if (button.customId === "join_game") {
          if (gameData.users.includes(button.user.id)) {
            return await button.reply({
              content: "You are already in the game",
              ephemeral: true,
            });
          }

          gameData.users.push(button.user.id);
          await button.reply({
            content: "You have joined the game",
            ephemeral: true,
          });

          const embed = new EmbedBuilder()
            .setTitle("Game was started!")
            .setAuthor({
              name: `Started by ${interaction.user.username}`,
              iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`Players: ${gameData.users.map((user) => `<@${user}>`).join(", \n")}`)
            .setColor(0xe2725b);
          await interaction.editReply({ embeds: [embed] });
        }
      });
      collector.on("end", async () => {
        await interaction.deleteReply();
        if (gameData.users.length < 2) {
          return await interaction.followUp({
            content: "The game has been cancelled due to not enough players",
          });
        }
        await interaction.channel.send({
          content: "The game has started!",
        });
        gameData.gameStarted = true;
        client.currentGames.set('currentGames', gameData);
      });
    }
  },
};
