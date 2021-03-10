import Discord, { Snowflake, TextChannel } from "discord.js";

const bot = new Discord.Client()!;

bot.on("ready", () => {
  console.log("The bot is online, let's trade!");
});

bot.login(process.env.DISCORD_TOKEN);

const server = bot.guilds.cache.get(process.env.SERVER_ID!)!;

const stockChannel = server.channels.cache.get(
  process.env.STOCK_CHANNEL_ID!
)! as TextChannel;

function getAllUserIDs(): Snowflake[] {
  return server.members.cache
    .filter((member) => !member.user.bot)
    .map((member) => member.id);
}

export { getAllUserIDs, stockChannel, server };
export default bot;
