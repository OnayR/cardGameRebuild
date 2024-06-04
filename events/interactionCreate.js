const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("@discordjs/builders");

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
      const game = client.currentGames.find((game) => game.users.includes(interaction.user.id));
      const userIndex = game.users.indexOf(interaction.user.id);
      const user = users[userIndex];
      const userDeck = game.userDecks[userIndex];

      const embed = new EmbedBuilder()
        .setTitle("Your Deck")
        .setDescription(userDeck.join("\n").split(",").join(" "))
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
            .setValue(userDeck[i][0] + '_' + userDeck[i][1])
            .setImage
        );
      }

      await interaction.reply({ embeds: [embed], components: [selectMenu], ephemeral: true });
      
      console.log(game.gameId);
      console.log(userIndex);
      console.log(userDeck);
    }
  }
});
