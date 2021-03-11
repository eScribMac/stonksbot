import a from "axios";
import rateLimit from "axios-rate-limit";

const { server } = await import("./bot.js");

// closure to check the number of requests every so often
// the precise frequency isn't super important so it's ok so do this in memory
let numRequests = 0;

const axios = rateLimit(
  a.create({
    baseURL: process.env.API_HOST,
    params: {
      token: process.env.API_KEY,
    },
  }),
  { maxRequests: 1, perMilliseconds: 150 }
);

axios.interceptors.request.use(
  function (config) {
    if (++numRequests % 10 === 0 && config.url !== "/account/metadata") {
      checkBalance();
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

async function checkBalance() {
  const {
    data: { creditLimit, creditsUsed },
  } = await axios.get("/account/metadata");
  const usedPercent = creditsUsed / creditLimit;
  console.log(creditsUsed, "/", creditLimit);
  if (usedPercent > 0.8) {
    server!.owner!.send(
      `Approaching credit limit!! ${creditsUsed}/${creditLimit}`
    );
  }
}

async function quoteCrypto(symbol: string): Promise<Number> {
  const {
    data: { latestPrice },
  } = await axios.get(`/crypto/${symbol}/quote`);
  return Number(latestPrice);
}

async function quote(symbol: string): Promise<Number> {
  const { data } = await axios.get(`/stock/${symbol}/quote/latestPrice`);
  return data;
}

export { checkBalance, quoteCrypto, quote };
