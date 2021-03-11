import a from "axios";
import rateLimit from "axios-rate-limit";

const { server } = await import("./bot.js");

const axios = rateLimit(
  a.create({
    baseURL: "https://sandbox.iexapis.com/stable",
    params: {
      token: process.env.API_KEY,
    },
  }),
  { maxRequests: 2, perMilliseconds: 1000, maxRPS: 2 }
);

axios.interceptors.request.use(
  function (config) {
    console.log(config.url);
    if (config.url !== "/account/metadata") {
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
  return latestPrice;
}

async function quote(symbol: string): Promise<Number> {
  const { data } = await axios.get(`/stock/${symbol}/quote/latestPrice`);
  return data;
}

export { checkBalance, quoteCrypto, quote };
