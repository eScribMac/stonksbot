import { Snowflake } from "discord.js";
import { quoteCrypto, quote } from "../api.js";
import { getHoldings, transact, getCurrentQuantity } from "../db.js";

async function buyHandler(id: Snowflake, args: string[]) {
  return preprocessTransaction(id, args, quote, false, true);
}

async function buyCryptoHandler(id: Snowflake, args: string[]) {
  return preprocessTransaction(id, args, quoteCrypto, true, true);
}

async function sellHandler(id: Snowflake, args: string[]) {
  return preprocessTransaction(id, args, quoteCrypto, false, false);
}

async function sellCryptoHandler(id: Snowflake, args: string[]) {
  return preprocessTransaction(id, args, quoteCrypto, true, false);
}

async function preprocessTransaction(
  id: Snowflake,
  args: string[],
  quoteCallback: Function,
  crypto: boolean,
  buy: boolean
) {
  const validation = validateTransactionArguments(args);
  if (validation) {
    return validation;
  }
  const [symbol, quantityString] = args;
  const quantity = Number(quantityString);

  const price = await quoteCallback(symbol);
  return processTransaction(id, price, quantity, symbol, crypto, buy);
}

async function processTransaction(
  id: Snowflake,
  price: number,
  quantity: number,
  symbol: string,
  crypto: boolean,
  buy: boolean
) {
  const holdings = getHoldings(id);
  let totalCost = price * quantity;
  if (buy) {
    if (totalCost > holdings) {
      return [
        `Sadly, you can't afford that`,
        `Maybe you should have trusted Elon`,
      ];
    }
  } else {
    const currentQuantity = await getCurrentQuantity(id, symbol);
    if (currentQuantity < quantity) {
      return [`You only have ${currentQuantity} shares right now`];
    }
    // if you're selling, these numbers are reveresed
    quantity *= -1;
    totalCost *= -1;
  }

  transact(id, symbol, quantity, totalCost, crypto);
  return [
    `Successfully transacted ${quantity} shares of ${symbol}`,
    `Probably.`,
    `I don't have error logging for this part yet...`,
  ];
}

function validateTransactionArguments(args: string[]): false | string[] {
  if (args.length < 2) {
    return [`I can't make sense of that, try !help`];
  }
  const [symbol, quantityString] = args;
  const quantity = Number(quantityString);
  if (!quantity) {
    return [
      `You can't buy ${quantityString} of ${symbol}`,
      `That doesn't even make sense...`,
    ];
  }
  return false;
}

export { buyHandler, sellHandler, buyCryptoHandler, sellCryptoHandler };
