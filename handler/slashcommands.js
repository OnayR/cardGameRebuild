const discord = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const config = require("../config/config");
const { readdirSync } = require("fs");
let cmds = [];
try {
  const commandFiles = readdirSync(`./commands/`).filter((file) =>
    file.endsWith(".js")
  );
  for (const file of commandFiles) {
    const slashCommand = require(`../commands/${file}`);
    client.slashCommand.set(slashCommand.data.name, slashCommand);
  }
} catch (e) {
  console.log(e);
}
const rest = new REST({ version: "9" }).setToken(config.token);
(async () => {
  try {
    for (let i = 0; i < client.slashCommand.toJSON().length; i++) {
      cmds.push(client.slashCommand.toJSON()[i].data.toJSON());
    }
    setTimeout(async function () {
      await rest.put(
        Routes.applicationCommands(
          "1246537713964814428",
          "1246537713964814428"
        ),
        {
          body: cmds,
        }
      );
      console.log("Succesfully pushed Slash Commands to Discord");
    }, 5000);
  } catch (err) {
    console.log("❌ Failed to push Slash Commands to Discord");
  }
})();
