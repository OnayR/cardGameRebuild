/**********************************************************
 * @INFO  [TABLE OF CONTENTS]
 * 1  disocrd_client
 * 2  handler
 * 3  bot_login
 *********************************************************/

const discord = require("discord.js");
const config = require("./config/config.json");

/**********************************************************
 * @param {1} discord_client
 *********************************************************/

client = new discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],

  shards: "auto",

  intents: [
    discord.GatewayIntentBits.Guilds,
    discord.GatewayIntentBits.GuildMembers,
    discord.GatewayIntentBits.GuildIntegrations,
    discord.GatewayIntentBits.GuildWebhooks,
    discord.GatewayIntentBits.GuildInvites,
    discord.GatewayIntentBits.GuildVoiceStates,
    discord.GatewayIntentBits.GuildPresences,
    discord.GatewayIntentBits.GuildMessages,
    discord.GatewayIntentBits.MessageContent,
    discord.GatewayIntentBits.GuildMessageReactions,
    discord.GatewayIntentBits.GuildMessageTyping,
    discord.GatewayIntentBits.DirectMessages,
    discord.GatewayIntentBits.DirectMessageReactions,
    discord.GatewayIntentBits.DirectMessageTyping,
  ],

  presence: {
    activities: [{ name: `${config.status.text}` }],
    status: "online",
  },
});

client.deckCollection = new discord.Collection();
client.basicCommands = new discord.Collection();
client.slashCommand = new discord.Collection();
client.aliases = new discord.Collection();
client.players = new discord.Collection();


client.on("shardReady", (shardID) => {
  console.log(`shard#${shardID} ready`);
});
client.on("shardDisconnect", (s, shardID) => {
  console.log(`shard#${shardID} disconnected`);
});
client.on("shardError", (error1, shardID) => {
  console.log(`shard#${shardID} error: ${error1}`);
});
client.on("shardReconnecting", (shardID) => {
  console.log(`shard#${shardID} connecting`);
});

/**********************************************************
 * @param {2} handler
 *********************************************************/

function requirehandlers() {
  ["events", "slashcommands"].forEach((handler) => {
    try {
      require(`./handler/${handler}`);
    } catch (e) {
      console.log(e);
    }
  });
}
requirehandlers();

/**********************************************************
 * @param {3} bot_login
 *********************************************************/

client.login(config.token);
