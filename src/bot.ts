import * as dotenv from "dotenv";
import * as path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import Discord, { Snowflake, TextChannel } from "discord.js";

const bot = new Discord.Client()!;

await bot.login(process.env.DISCORD_TOKEN);

await new Promise<void>((resolve, reject) => {
  bot.on("ready", () => {
    console.log("The bot is online, let's trade!");
    resolve();
  });
});

const server = bot.guilds.cache.get(process.env.SERVER_ID!)!;

const stockChannel = server.channels.cache.get(
  process.env.STOCK_CHANNEL_ID!
)! as TextChannel;

function getAllUserIDs(): Snowflake[] {
  return server.members.cache
    .filter((member) => !member.user.bot)
    .map((member) => member.id);
}

export { bot, getAllUserIDs, stockChannel, server };
