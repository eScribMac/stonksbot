import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import bot, { stockChannel } from "./bot";
import { initializeDatabase, insertUser, STARTING_FUNDS } from "./db";

initializeDatabase();

// register a handler that adds a new user when they join the server
bot.on("guildMemberAdd", (member) => {
  if (member.user.bot) return;
  insertUser(member.id);
});

bot.on("message", (message) => {
  if (!message.mentions.has(bot.user!)) return;
  if (message.author.id === bot.user!.id) return;
  if (message.author.bot) return;
});
