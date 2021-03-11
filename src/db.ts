import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

import Database from "better-sqlite3";
import * as path from "path";
const { getAllUserIDs, server, stockChannel } = await import("./bot.js");
import { Snowflake } from "discord.js";

export const STARTING_FUNDS = 100_000;

const db = new Database(path.join(__dirname, "..", "db", "db.db"), {
  verbose: console.log,
});

export function initializeDatabase() {
  createTables();
  addNewUsers();
}

function createTables() {
  db.prepare(
    `CREATE TABLE IF NOT EXISTS user (
                user_id TEXT PRIMARY KEY,
                holdings INTEGER NOT NULL
              );`
  ).run();
  db.prepare(
    `CREATE TABLE IF NOT EXISTS positions (
                user_id TEXT NOT NULL,
                symbol TEXT NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                crypto INTEGER NOT NULL,
                FOREIGN KEY(user_id) REFERENCES user(user_id),
                UNIQUE(user_id,symbol)
              );`
  ).run();
}

function selectUsers() {
  const users = db
    .prepare(
      `SELECT user_id
          FROM user;`
    )
    .all();
  return users.map(({ user_id }) => user_id) || [];
}

// adds anyone who joined since the bot was last online, and is not in `users`
function addNewUsers() {
  const dbUsersMap = new Map(selectUsers().map((id) => [id, true]));
  const serverUsers = getAllUserIDs();
  serverUsers.forEach((user) => {
    if (!dbUsersMap.has(user)) insertUser(user);
  });
}

export function insertUser(userID: Snowflake) {
  db.prepare("INSERT INTO user(user_id, holdings) VALUES(?, ?)").run(
    userID,
    STARTING_FUNDS
  );
  // stockChannel.send(
  //   `Welcome <@${userID}>! You have been added to our Stock Simulator Game and you have been given $${STARTING_FUNDS} to start trading!`
  // );
  // setTimeout(
  //   () => stockChannel.send(`For more information, mention me and type !help`),
  //   2000
  // );
}

export function getHoldings(userID: Snowflake) {
  const { holdings } = db
    .prepare(
      `SELECT holdings
        FROM user
        where user_id = ?;`
    )
    .get(userID);
  return holdings;
}

export function transact(
  userID: Snowflake,
  symbol: string,
  quantity: number,
  totalCost: number,
  crypto: boolean
) {
  db.prepare(
    `UPDATE user SET holdings = holdings - ? 
              WHERE user_ID = ?`
  ).run(totalCost, userID);
  db.prepare(`INSERT OR IGNORE INTO positions VALUES(?, ?, ?, ?)`).run(
    userID,
    symbol,
    0,
    +crypto
  );
  db.prepare(
    `UPDATE positions SET quantity = quantity + ? WHERE user_id = ? AND symbol = ?`
  ).run(quantity, userID, symbol);
}

export function getCurrentQuantity(id: Snowflake, symbol: string) {
  const { quantity } = db
    .prepare(`SELECT quantity FROM positions WHERE user_id = ? AND symbol = ?`)
    .get(id, symbol);
  return quantity || 0;
}

export function getAllPositions(id: Snowflake) {
  return db
    .prepare(
      `SELECT positions.user_id, holdings, symbol, quantity, crypto 
                      FROM positions
                      JOIN user ON positions.user_id = user.user_id
                      WHERE positions.user_id = ?`
    )
    .all(id);
}
