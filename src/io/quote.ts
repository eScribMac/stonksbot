import { Snowflake } from "discord.js";
import { quoteCrypto, quote } from "../api.js";

async function quoteHandler(_id: Snowflake, [symbol]: string[]) {
  // TODO: find a better way to handle args
  try {
    const quoteResult = await quote(symbol);
    return [`The latest price for ${symbol} is ${quoteResult}`];
  } catch (err) {
    if (err.response.status === 404) {
      return ["I don't know that symbol"];
    }
    return ["You broke stonkbot. You should feel terrible"];
  }
}

async function quoteCryptoHandler(_id: Snowflake, [symbol]: string[]) {
  // TODO: find a better way to handle args
  try {
    const quoteResult = await quoteCrypto(symbol);
    return [`The latest price for ${symbol} is ${quoteResult}`];
  } catch (err) {
    if (err.response.status === 404) {
      return ["I don't know that symbol"];
    }
    return ["You broke stonkbot. You should feel terrible"];
  }
}

export { quoteHandler, quoteCryptoHandler };
