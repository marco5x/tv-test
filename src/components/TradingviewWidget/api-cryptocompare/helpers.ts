// This is a simple implementation of the CryptoCompare streaming API
// https://github.com/tradingview/charting-library-tutorial

export const apiKey = import.meta.env.VITE_CCDATA_API_KEY;
// Makes requests to CryptoCompare API
export async function makeApiRequest(path: string) {
  try {
    // const url = new URL(`https://min-api.cryptocompare.com${path}`);
    const url = new URL(`https://data-api.cryptocompare.com${path}`);
    url.searchParams.append('api_key', apiKey);
    const response = await fetch(url.toString());
    return response.json();
  } catch (error) {
    throw new Error(`CryptoCompare request error: ${error.status}`);
  }
}

export async function makeApiRequestBybit(path: string ) {
  try {
    // const url = new URL(`https://min-api.cryptocompare.com${path}`);
    const url = new URL(`https://api.bybit.com${path}`);
    const response = await fetch(url.toString());
    return response.json();
  } catch (error) {
    throw new Error(`${error}`);
  }
}
