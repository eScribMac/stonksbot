import { handleMessage } from "./io/index.js";
const { bot } = await import("./bot.js");
const { initializeDatabase, insertUser } = await import("./db.js");

function main() {
  initializeDatabase();

  // register a handler that adds a new user when they join the server
  bot.on("guildMemberAdd", (member) => {
    if (member.user.bot) return;
    insertUser(member.id);
  });

  bot.on("message", (message) => {
    if (!message.mentions.has(bot.user!)) return;
    if (message.author.bot) return;
    handleMessage(message);
  });
}

main();

export default main;
