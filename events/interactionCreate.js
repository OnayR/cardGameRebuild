const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("@discordjs/builders");
const game = require("../commands/game");

let games = [];
let users = [];

client.on("interactionCreate", async (interaction) => {
  try {
    const { commandName } = interaction;

    if (interaction.isCommand() || client.slashCommand.has(commandName)) {
      const command = await client.slashCommand.get(commandName);

      if (command) await command.execute(interaction);
      console.log(
        `${interaction.user.username}#${interaction.user.discriminator} ran the command: /${commandName}`
      );
    }
  } catch (e) {
    return console.log(e);
  }

  if(interaction.isButton()) {
    if(interaction.customId.includes("view_deck")) {
      const gameData = client.currentGames.find((game) => game.users.includes(interaction.user.id));
      const userIndex = gameData.users.indexOf(interaction.user.id);
      const userDeck = gameData.userDecks[userIndex];

      const embed = new EmbedBuilder()
        .setTitle("Your Deck")
        .setDescription(userDeck.map(card => card[0] + ' ' + card[1]).join("\n"))
        .setColor(0xe2725b);

      let selectMenu = new ActionRowBuilder().addComponents(
              new StringSelectMenuBuilder().setCustomId("select_card").setPlaceholder("Select a card").setMinValues(1).setMaxValues(1)
      );

      selectMenu.components[0].addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Grab a card")
          .setValue("grab")
      )

      for (let i = 0; i < userDeck.length; i++) {
        selectMenu.components[0].addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(userDeck[i][0] + ' ' + userDeck[i][1])
            .setValue(userDeck[i][0] + '_' + userDeck[i][1] + '_' + userDeck[i][2])
        );
      }

      await interaction.reply({ embeds: [embed], components: [selectMenu], ephemeral: true });
    }
  }

  if(interaction.isSelectMenu()) {
    if(interaction.customId === "select_card") {
      const gameData = client.currentGames.find((game) => game.users.includes(interaction.user.id));
      const userIndex = gameData.users.indexOf(interaction.user.id);
      const userDeck = gameData.userDecks[userIndex];
      const selectedCard = interaction.values[0].split("_");

      if (interaction.user.id !== gameData.currentPlayer) return await interaction.reply({ content: "It's not your turn", ephemeral: true });

      if (gameData.direction === 1) {
        gameData.currentPlayer = gameData.users[(gameData.users.indexOf(interaction.user.id) + 1) % gameData.users.length];
      } else {
        gameData.currentPlayer = gameData.users[(gameData.users.indexOf(interaction.user.id) - 1 + gameData.users.length) % gameData.users.length];
      }

      const user = await client.users.fetch(gameData.currentPlayer);

      const message = await interaction.channel.messages.fetch(gameData.messageId);
      await message.delete();

      const button = new ButtonBuilder()
          .setLabel("View Deck")
          .setStyle("Primary")
          .setCustomId(`view_deck-${gameData.gameId}`);


      if(selectedCard[0] === "grab") {

        const gameEmbed = new EmbedBuilder()
            .setTitle("Uno!")
            .setImage(`https://raw.githubusercontent.com/OnayR/cardGameRebuild/main/cards/${gameData.currentCard[0][0]}-${gameData.currentCard[0][1]}.png`)
            .setColor(0xe2725b)
            .setFooter({
              text: `${user.username}'s turn | Game ID: ${gameData.gameId}`
            });

        const row = new ActionRowBuilder().addComponents(button);

        if(gameData.deck.length > 0) {
          const grabbedCard = gameData.deck.shift();
          userDeck.push(grabbedCard);

          console.log("grabbed Card" + grabbedCard);

          const embed = new EmbedBuilder()
            .setTitle(`You grabbed a ${grabbedCard[0]} ${grabbedCard[1]}`)
            .setColor(0xe2725b)
            .setImage(`https://raw.githubusercontent.com/OnayR/cardGameRebuild/main/cards/${grabbedCard[0]}-${grabbedCard[1]}.png`);


          await interaction.reply({ embeds: [embed], ephemeral: true });
          
          gameData.messageId = (await interaction.channel.send({ embeds: [gameEmbed], components: [row] })).id;
        } else {
          await interaction.reply("There are no more cards in the deck, You're in luck!");

          await interaction.channel.send({ embeds: [gameEmbed], components: [row] });

        }
      } else {
        const cardIndex = userDeck.findIndex(card => card[0] === selectedCard[0] && card[1] === selectedCard[1] && card[2] === selectedCard[2]);
        const card = userDeck[cardIndex];

        userDeck.splice(cardIndex, 1);
        gameData.deck.push(gameData.currentCard[0]);
        gameData.currentCard[0] = card;

        gameData.deck = gameData.deck.sort(() => Math.random() - 0.5);

        console.log(gameData);

        const row = new ActionRowBuilder().addComponents(button);

        const embed = new EmbedBuilder()
          .setTitle("Uno!")
          .setImage(`https://raw.githubusercontent.com/OnayR/cardGameRebuild/main/cards/${gameData.currentCard[0][0]}-${gameData.currentCard[0][1]}.png`)
          .setColor(0xe2725b)
          .setFooter({
            text: `${user.username}'s turn | Game ID: ${gameData.gameId}`
          });

        await interaction.reply({ content: `You picked a ${card[0]} ${card[1]}`, ephemeral: true })

        gameData.messageId = (await interaction.channel.send({ embeds: [embed], components: [row] })).id;

        client.currentGames.set(`game-${gameData.gameId}`, gameData);
      }
    }
  }
});
