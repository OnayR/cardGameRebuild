const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("@discordjs/builders");
const game = require("../commands/game");

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
      console.log("view deck button clicked");
      const gameData = client.currentGames.find((game) => game.users.includes(interaction.user.id));
      console.log(gameData);
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

      if (gameData.currentPlayer !== interaction.user.id) {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed], components: [selectMenu], ephemeral: true });
      }
    }
  }

  if(interaction.isStringSelectMenu()) {
    if(interaction.customId === "select_card") {
      const gameData = client.currentGames.find((game) => game.users.includes(interaction.user.id));
      const userIndex = gameData.users.indexOf(interaction.user.id);
      const userDeck = gameData.userDecks[userIndex];
      const selectedCard = interaction.values[0].split("_");

      gameData.drawCard = true;

      if (interaction.user.id !== gameData.currentPlayer) return await interaction.reply({ content: "It's not your turn", ephemeral: true });

      function turnDirection() {
        if (gameData.direction === 1) {
          gameData.currentPlayer = gameData.users[(gameData.users.indexOf(gameData.currentPlayer) + 1) % gameData.users.length];
        } else {
          gameData.currentPlayer = gameData.users[(gameData.users.indexOf(gameData.currentPlayer) - 1 + gameData.users.length) % gameData.users.length];
        }
      }

      function checkCard() {
        if (gameData.drawCard === true && gameData.draw > 0) {
          interaction.channel.send(`<@${interaction.user.id}> drew ${gameData.draw} cards!`);
          for (let i = 0; i < gameData.draw; i++) {
            userDeck.push(gameData.deck.shift());
          }
          gameData.drawCard = false;
          gameData.draw = 0;
        }
      }

      const message = await interaction.channel.messages.fetch(gameData.messageId);

      const button = new ButtonBuilder()
          .setLabel("View Deck")
          .setStyle("Primary")
          .setCustomId(`view_deck-${gameData.gameId}`);


      if(selectedCard[0] === "grab") {
        turnDirection();
        const user = await client.users.fetch(gameData.currentPlayer);
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

          const embed = new EmbedBuilder()
            .setTitle(`You grabbed a ${grabbedCard[0]} ${grabbedCard[1]}`)
            .setColor(0xe2725b)
            .setImage(`https://raw.githubusercontent.com/OnayR/cardGameRebuild/main/cards/${grabbedCard[0]}-${grabbedCard[1]}.png`);

          await message.delete();
          await interaction.reply({ embeds: [embed], ephemeral: true });
          
          gameData.messageId = (await interaction.channel.send({ embeds: [gameEmbed], components: [row] })).id;

        } else {
          await interaction.reply("There are no more cards in the deck, You're in luck!");
          await message.delete();
          await interaction.channel.send({ embeds: [gameEmbed], components: [row] });

        }
        checkCard();
      } else {
        // Find the card in the user's deck
        const cardIndex = userDeck.findIndex(card => card[0] === selectedCard[0] && card[1] === selectedCard[1] && card[2] === selectedCard[2]);
        const card = userDeck[cardIndex];

        // Check if the card is valid or wild
        if (gameData.selectedColor !== null && card[0] !== gameData.selectedColor) {
          return await interaction.reply({ content: `You can't play that card, it has to be a ${gameData.selectedColor}.`, ephemeral: true });
        } else if (card[0] === "wild") {
          // Check if the card is a draw 4 card
          if(card[1] === "draw4") {
            gameData.draw += 4;
            gameData.drawCard = false;
          }

        } else if (gameData.currentCard[0][0] === "wild") {
        } else if (card[0] !== gameData.currentCard[0][0] && card[1] !== gameData.currentCard[0][1]) {
          return await interaction.reply({ content: "You can't play that card", ephemeral: true });
        }

        if(card[1] === "draw2") {
          gameData.draw += 2;
          gameData.drawCard = false;
        }

        if (card[1] === "reverse") {
          if (gameData.users.length === 2) {
            gameData.currentPlayer = gameData.users[(gameData.users.indexOf(gameData.currentPlayer) + 1) % gameData.users.length];
          }
          gameData.direction = 1 ? 0 : 1;
        }

        if (card[1] === "skip") {
          gameData.currentPlayer = gameData.users[(gameData.users.indexOf(gameData.currentPlayer) + 1) % gameData.users.length];
        }

        turnDirection();

        const user = await client.users.fetch(gameData.currentPlayer);

        userDeck.splice(cardIndex, 1);
        gameData.deck.push(gameData.currentCard[0]);
        gameData.currentCard[0] = card;

        gameData.deck = gameData.deck.sort(() => Math.random() - 0.5);

        if (userDeck.length === 0) {
          await interaction.channel.send(`<@${interaction.user.id}> has won the game!`);
          client.currentGames.delete(`game-${gameData.gameId}`);
          return;
        }

        const row = new ActionRowBuilder().addComponents(button);

        const embed = new EmbedBuilder()
          .setTitle("Uno!")
          .setImage(`https://raw.githubusercontent.com/OnayR/cardGameRebuild/main/cards/${gameData.currentCard[0][0]}-${gameData.currentCard[0][1]}.png`)
          .setColor(0xe2725b)
          .setFooter({
            text: `${user.username}'s turn | Game ID: ${gameData.gameId}`
          });
        
        await message.delete();

        // Check if the card is a picker card (put at the end to prevent duplicate code)
        gameData.selectedColor = null;
        if(card[1] === "picker") {
          await interaction.channel.send(`<@${interaction.user.id}> played a picker card! They are currently picking a color!`);
          const pickerEmbed = new EmbedBuilder()
            .setTitle("Pick a color")
            .setColor(0xe2725b)
            .setDescription("Choose a color for the next player to play");

          let selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder().setCustomId("select_color").setPlaceholder("Select a color").setMinValues(1).setMaxValues(1)
          );
          
          selectMenu.components[0].addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Red")
              .setValue("red")
          );

          selectMenu.components[0].addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Blue")
              .setValue("blue")
          );

          selectMenu.components[0].addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Green")
              .setValue("green")
          );

          selectMenu.components[0].addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Yellow")
              .setValue("yellow")
          );

          // Send the message and wait for a reply
          await interaction.reply({ embeds: [pickerEmbed], components: [selectMenu], ephemeral: true });

          checkCard();

          await interaction.channel.send(`${interaction.user.username} is picking a color!`);

          client.currentGames.set(`game-${gameData.gameId}`, gameData);
          return;
        }
        // end picker card
        
        await interaction.reply(`You played a ${card[0]} ${card[1]}!`, { ephemeral: true })

        gameData.messageId = (await interaction.channel.send({ embeds: [embed], components: [row] })).id;

        checkCard();

        if (card[1] === "0") {
            let lastDeck = gameData.userDecks.pop();
            gameData.userDecks.unshift(lastDeck);

            await interaction.channel.send("A 0 card was played, all decks have been shifted!");
        }

        client.currentGames.set(`game-${gameData.gameId}`, gameData);
      }
    }


    // Select color
    if (interaction.customId === "select_color") {
      const gameData = client.currentGames.find((game) => game.users.includes(interaction.user.id));
      const userIndex = gameData.users.indexOf(interaction.user.id);
      const userDeck = gameData.userDecks[userIndex];
      const selectedColor = interaction.values[0];

      const user = await client.users.fetch(gameData.currentPlayer);
      
      gameData.selectedColor = selectedColor;
      console.log("selected color: " + selectedColor);

      const embed = new EmbedBuilder()
          .setTitle("Uno!")
          .setImage(`https://raw.githubusercontent.com/OnayR/cardGameRebuild/main/cards/${gameData.currentCard[0][0]}-${gameData.currentCard[0][1]}.png`)
          .setColor(0xe2725b)
          .setFooter({
            text: `${user.username}'s turn | Game ID: ${gameData.gameId}`
          });
      
      const button = new ButtonBuilder()
      .setLabel("View Deck")
      .setStyle("Primary")
      .setCustomId(`view_deck-${gameData.gameId}`);

      const row = new ActionRowBuilder().addComponents(button);

      gameData.messageId = (await interaction.channel.send({ embeds: [embed], components: [row] })).id;

      await interaction.channel.send({ content: `<@${interaction.user.id}> selected ${selectedColor}` });
      client.currentGames.set(`game-${gameData.gameId}`, gameData);
    }
  }
});
