import { Snowflake } from "discord.js";
import { quote, quoteCrypto } from "../api.js";
import { getAllPositions } from "../db.js";

async function rankingsHandler() {
  return ["NOT YET IMPLEMENTED"];
}

async function portfolioHandler(requester_id: Snowflake, args: string[]) {
  const id = args[0].slice(3, -1);
  const positions = getAllPositions(id);
  const positionsWithValues = await Promise.all(
    positions.map(async (position) => {
      const value = position.crypto
        ? await quoteCrypto(position.symbol)
        : await quote(position.symbol);
      return {
        value,
        ...position,
      };
    })
  );

  const transformedPositions = positionsWithValues.reduce(
    (acc, { holdings, symbol, quantity, value }) => {
      return {
        holdings,
        totalPositionValue: acc.totalPositionValue + value,
        positions: [
          ...acc.positions,
          {
            symbol,
            quantity,
            value,
          },
        ],
      };
    },
    { holdings: 0, positions: [], totalPositionValue: 0 }
  );
  const holdingsString = `${transformedPositions.holdings.toLocaleString(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    }
  )} in cash`;
  const positionStrings = transformedPositions.positions.map(
    // @ts-ignore
    ({ symbol, quantity, value }) =>
      `${symbol}: ${quantity} units at ${value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}`
  );
  const totalValue =
    transformedPositions.holdings + transformedPositions.totalPositionValue;
  return [
    `Here is the summary for ${args[0]}`,
    holdingsString,
    ...positionStrings,
    `Total Portfolio Value: ${totalValue.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}`,
  ];
}

export { rankingsHandler, portfolioHandler };
