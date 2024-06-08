let deck = [
    ["red", "0", "1"], ["red", "1", "1"], ["red", "1", "2"], ["red", "2", "1"], ["red", "2", "2"], ["red", "3", "1"], ["red", "3", "2"], ["red", "4", "1"], ["red", "4", "2"], ["red", "5", "1"], ["red", "5", "2"], ["red", "6", "1"], ["red", "6", "2"], ["red", "7", "1"],
    ["red", "7", "2"], ["red", "8", "1"], ["red", "8", "2"], ["red", "9", "1"], ["red", "9", "2"], ["red", "skip", "1"], ["red", "skip", "2"], ["red", "reverse", "1"], ["red", "reverse", "2"], ["red", "draw2", "1"], ["red", "draw2", "2"],
    ["blue", "0", "1"], ["blue", "1", "1"], ["blue", "1", "2"], ["blue", "2", "1"], ["blue", "2", "2"], ["blue", "3", "1"], ["blue", "3", "2"], ["blue", "4", "1"], ["blue", "4", "2"], ["blue", "5", "1"], ["blue", "5", "2"], ["blue", "6", "1"], ["blue", "6", "2"], ["blue", "7", "1"],
    ["blue", "7", "2"], ["blue", "8", "1"], ["blue", "8", "2"], ["blue", "9", "1"], ["blue", "9", "2"], ["blue", "skip", "1"], ["blue", "skip", "2"], ["blue", "reverse", "1"], ["blue", "reverse", "2"], ["blue", "draw2", "1"], ["blue", "draw2", "2"],
    ["green", "0", "1"], ["green", "1", "1"], ["green", "1", "2"], ["green", "2", "1"], ["green", "2", "2"], ["green", "3", "1"], ["green", "3", "2"], ["green", "4", "1"], ["green", "4", "2"], ["green", "5", "1"], ["green", "5", "2"], ["green", "6", "1"], ["green", "6", "2"], ["green", "7", "1"],
    ["green", "7", "2"], ["green", "8", "1"], ["green", "8", "2"], ["green", "9", "1"], ["green", "9", "2"], ["green", "skip", "1"], ["green", "skip", "2"], ["green", "reverse", "1"], ["green", "reverse", "2"], ["green", "draw2", "1"], ["green", "draw2", "2"],
    ["yellow", "0", "1"], ["yellow", "1", "1"], ["yellow", "1", "2"], ["yellow", "2", "1"], ["yellow", "2", "2"], ["yellow", "3", "1"], ["yellow", "3", "2"], ["yellow", "4", "1"], ["yellow", "4", "2"], ["yellow", "5", "1"], ["yellow", "5", "2"], ["yellow", "6", "1"], ["yellow", "6", "2"], ["yellow", "7", "1"],
    ["yellow", "7", "2"], ["yellow", "8", "1"], ["yellow", "8", "2"], ["yellow", "9", "1"], ["yellow", "9", "2"], ["yellow", "skip", "1"], ["yellow", "skip", "2"], ["yellow", "reverse", "1"], ["yellow", "reverse", "2"], ["yellow", "draw2", "1"], ["yellow", "draw2", "2"],
    ["wild", "picker", "1"], ["wild", "picker", "2"], ["wild", "draw4", "1"], ["wild", "draw4", "2"], ["wild", "draw4", "3"], ["wild", "draw4", "4"]
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
      const currentGame = client.currentGames.find((game) => game.users.includes(interaction.user.id));
      if (currentGame !== undefined) {
        return await interaction.reply({
          content: "You are already in a game",
          ephemeral: true,
        });
      }
      let gameId = client.currentGames.size + 1;
      while (client.currentGames.has(gameId)) {
        gameId++;
      }
      let gameData = {
        gameId: gameId,
        users: [interaction.user.id],
        deck: deck,
        userDecks: [],
        currentCard: [],
        currentPlayer: interaction.user.id,
        direction: 1,
        messageId: null,
        draw: 0,
        selectedColor: null,
        drawCard: false,
        gameStarted: false,
        gameEnded: false,
      };
      client.currentGames.set(`game-${gameData.gameId}`, gameData);

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
        .setDescription(`Players: \n <@${interaction.user.id}>`)
        .setColor(0xe2725b)
        .setFooter({
          text: `Game ID: ${gameId}`});

      await interaction.reply({
        embeds: [embed],
        components: [row],
      });

      // create a collector to listen for button clicks
      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
      });

      // when a button is clicked add the user to the game
      collector.on("collect", async (button) => {
        if (button.customId === "join_game") {
          if (currentGame !== undefined) {
            return await interaction.reply({
              content: "You are already in a game",
              ephemeral: true,
            });
          }
          if (gameData.users.includes(button.user.id)) {
            return await button.reply({
              content: "You are already in the game",
              ephemeral: true,
            });
          }

          if (gameData.users.length === 10) {
            return await button.reply({
              content: "The game is full",
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
            .setDescription(`Players: \n ${gameData.users.map((user) => `<@${user}>`).join(", \n")}`)
            .setColor(0xe2725b)
            .setFooter({
              text: `Game ID: ${gameId}`
          });
          await interaction.editReply({ embeds: [embed] });
        }
      });
      collector.on("end", async () => {
        await interaction.deleteReply();
        if (gameData.users.length < 2) {
          client.currentGames.delete(`game-${gameData.gameId}`);
          return await interaction.followUp({
            content: "The game has been cancelled due to not enough players",
          });
        }
        await interaction.channel.send({
          content: "The game has started!",
        });
        gameData.gameStarted = true;

        // shuffle the deck
        gameData.deck = gameData.deck.sort(() => Math.random() - 0.5);

        // deal the cards
        gameData.users.forEach((user) => {
          gameData.userDecks.push(deck.splice(0, 7));
        });

        // place the first card
        gameData.currentCard.push(gameData.deck.shift());

        // check if the first card is a special card
        while (gameData.currentCard[0][0] === "wild" || gameData.currentCard[0][1] === "draw2" || gameData.currentCard[0][1] === "skip" || gameData.currentCard[0][1] === "reverse") {
          gameData.deck.push(gameData.currentCard[0]);
          gameData.currentCard[0] = gameData.deck.shift();
        }

        // Get the current player
        const user = await client.users.fetch(gameData.currentPlayer);

        const button = new ButtonBuilder()
          .setLabel("View Deck")
          .setStyle("Primary")
          .setCustomId(`view_deck-${gameData.gameId}`);

        const row = new ActionRowBuilder().addComponents(button);

        const embed = new EmbedBuilder()
          .setTitle("Uno!")
          .setImage(`https://raw.githubusercontent.com/OnayR/cardGameRebuild/main/cards/${gameData.currentCard[0][0]}-${gameData.currentCard[0][1]}.png`)
          .setColor(0xe2725b)
          .setFooter({
            text: `${user.username}'s turn | Game ID: ${gameId}`
          });

        await interaction.channel.send({ embeds: [embed], components: [row] });

        gameData.messageId = interaction.channel.lastMessageId;
        
        client.currentGames.set(`game-${gameData.gameId}`, gameData);
      });
    }
  },
};
