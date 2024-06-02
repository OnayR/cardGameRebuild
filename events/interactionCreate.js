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
});
