const discord = require("discord.js");
const fs = require("fs");

client.events = new discord.Collection();

const EventFiles = fs.readdirSync("./events/").filter((f) => f.endsWith(".js"));
EventFiles.forEach((file) => {
  require(`../events/${file}`);
});
console.log(`${EventFiles.length} Events Loaded`);
