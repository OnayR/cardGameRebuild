const {
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("@discordjs/builders");

let turn = 0;
let negativeTurn = 0;
let punish = false;
let twos = 0;
let jokers = 0;
let aas = false;
let boer = false;
let boerChange = "";
client.players.set("turn", turn);

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
