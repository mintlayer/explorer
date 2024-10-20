const CMC_URL = "https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=ml&convert=usd";

export const getCMCInfo = async () => {
  try {
    const response = await fetch(CMC_URL, {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.CMC_API_KEY,
      },
    });
    const data = await response.json();
    const quotes = data.data.ML.find(({ name }) => name === "Mintlayer").quote.USD;
    return quotes;
  } catch (error) {
    console.error(error);
  }
};
