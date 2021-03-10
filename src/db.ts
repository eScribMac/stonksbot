import sqlite from "sqlite3";
import * as path from "path";
import { getAllUserIDs, server, stockChannel } from "./bot";
import { Snowflake } from "discord.js";

const STARTING_FUNDS = 100_000;

const db = new sqlite.Database(path.join(__dirname, "..", "db", "db.db"));

function initializeDatabase() {
  createTables();
  addNewUsers();
}

function createTables() {
  db.serialize(function () {
    db.run(`CREATE TABLE IF NOT EXISTS user (
                user_id TEXT PRIMARY KEY,
                holdings INTEGER NOT NULL
              );`);
    db.run(`CREATE TABLE IF NOT EXISTS positions (
                user_id TEXT NOT NULL,
                symbol TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                type TEXT CHECK( type IN ('Security', 'Cryptocurrency') )   NOT NULL,
                FOREIGN KEY(user_id) REFERENCES user(user_id)
              );`);
  });
  db.close();
}

function selectUsers() {
  let users: string[] = [];
  db.all(
    `SELECT user_id
    FROM user`,
    (err, rows) => {
      if (err) {
        console.log(err);
        server.owner!.send(`Encountered an error selecting all users ${err}`);
      }
      users = rows.map(({ user_id }) => user_id);
    }
  );
  return users;
}

// adds anyone who joined since the bot was last online, and is not in `users`
function addNewUsers() {
  const usersMap = new Map(getAllUserIDs().map((id) => [id, true]));
  const dbUsers = selectUsers();
  dbUsers.forEach((user) => {
    if (!usersMap.has(user)) insertUser(user);
  });
}

function insertUser(userID: Snowflake) {
  db.run(
    "INSERT OR IGNORE INTO user(user_id, holdings) VALUES(?, ?)",
    userID,
    STARTING_FUNDS
  );
  db.close();
  stockChannel.send(
    `Welcome <@${userID}>! You have been added to our Stock Simulator Game and you have been given $${STARTING_FUNDS} to start trading!`
  );
  setTimeout(
    () => stockChannel.send(`For more information, mention me and type !help`),
    2000
  );
}

export { initializeDatabase, insertUser, STARTING_FUNDS };
