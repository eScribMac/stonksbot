import { Message, Snowflake, TextChannel } from "discord.js";
const { bot, server } = await import("../bot.js");
import { rankingsHandler, portfolioHandler } from "./portfolio.js";
import { quoteHandler, quoteCryptoHandler } from "./quote.js";
import {
  buyHandler,
  sellHandler,
  buyCryptoHandler,
  sellCryptoHandler,
} from "./transact.js";

interface Command {
  name: string;
  description: string;
  example: string;
  handler: (id: Snowflake, args: string[]) => Promise<string[]> | string[];
}

const COMMANDS: { [key: string]: Command } = {
  "!help": {
    name: "!help",
    description: "If you're reading this you've already figured it out!",
    example: "!help",
    handler: helpHandler,
  },
  "!rankings": {
    name: "!rankings",
    description:
      "Lists all members of the server and their current balance. NOT YET IMPLEMENTED",
    example: "!rankings",
    handler: rankingsHandler,
  },
  "!portfolio": {
    name: "!portfolio",
    description: "Detail on a specific users portfolio",
    example: `!portfolio ${server.owner?.user}`,
    handler: portfolioHandler,
  },
  "!quote": {
    name: "!quote",
    description: "Get a quote for a specifc IEX security",
    example: "!quote TSLA",
    handler: quoteHandler,
  },
  "!quote-crypto": {
    name: "!quote-crypto",
    description: "Get a quote for a specifc IEX listed cryptocurrency",
    example: "!quote-crypto BTC",
    handler: quoteCryptoHandler,
  },
  "!buy": {
    name: "!buy",
    description: "Purchase a security. Type a number of units after the symbol",
    example: "!buy TSLA 420",
    handler: buyHandler,
  },
  "!buy-crypto": {
    name: "!buy-crypto",
    description: "Purchase cryptocurrency",
    example: "!buy-crypto BTC 1337",
    handler: buyCryptoHandler,
  },
  "!sell": {
    name: "!help",
    description: "Sell a security",
    example: "!sell TSLA 20",
    handler: sellHandler,
  },
  "!sell-crypto": {
    name: "!sell-crypto",
    description: "Sell a cryptocurrency",
    example: "!sell-crypto BTC 1",
    handler: sellCryptoHandler,
  },
};

function helpHandler() {
  const introMessage = `Hello from Stonkbot! This bot allows you to simulate trading on the market! Here is a list of all commands:`;
  const messagesToSend = [introMessage];
  Object.values(COMMANDS).forEach((command) => {
    messagesToSend.push(prepareCommandMessage(command));
  });
  messagesToSend.push("and remember, stonks only go up!");
  return messagesToSend;
}

function prepareCommandMessage({ name, description, example }: Command) {
  return [name, description, "for example:", `${bot.user} \`${example}\``].join(
    "\n"
  );
}

async function handleMessage(message: Message) {
  try {
    const [_mention, command, ...args] = message.content.split(" ");
    if (COMMANDS[command]) {
      const responses = await COMMANDS[command].handler(
        message.author.id,
        args || []
      );
      sendSlowly(message.channel as TextChannel, responses);
    } else {
      message.channel.send(`I don't understand how to ${command}. Try !help`);
    }
  } catch (e) {
    message.channel.send("I'm sorry, I don't understand");
    console.log(e);
    server.owner!.send("Encountered an error handling a message: " + e);
  }
}

function sendSlowly(channel: TextChannel, responses: string[]): void {
  responses.forEach((response, index) => {
    setTimeout(() => {
      channel.send(response);
    }, index * 1000);
  });
}

export { handleMessage };
