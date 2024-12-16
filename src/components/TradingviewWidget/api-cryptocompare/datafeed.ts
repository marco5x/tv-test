import { makeApiRequest, makeApiRequestBybit } from './helpers.js';
import { subscribeOnStream, unsubscribeFromStream } from './streaming.js';

// This is a simple implementation of the CryptoCompare streaming API
// https://github.com/tradingview/charting-library-tutorial
const lastBarsCache = new Map();

export const supported_resolutions = [
  '1',
  '5',
  '30',
  '60',
  '120',
  '240',
  '720',
  'D',
  'W',
  // 'M',
];

// DatafeedConfiguration implementation
const configurationData = {
  supported_resolutions,
  supports_group_request: false,
  supports_marks: false,
  supports_search: true,
  supports_timescale_marks: false,
  exchanges: [
    {
      value: 'bybit',
      name: 'Bybit',
      desc: 'Bybit',
    },
  ],
  symbols_types: [
    {
      name: 'All',
      value: '',
    },
    {
      name: 'Perpetuals',
      value: 'linear',
    },
    {
      name: 'Inverse',
      value: 'inverse',
    },
  ],
};

// Obtains all symbols for all exchanges supported by CryptoCompare API
async function getAllSymbols() {
  const data = await makeApiRequest(`/futures/v1/markets/instruments?market=bybit`);
  let allSymbols = [];

  for (const exchange of configurationData.exchanges) {
    const instruments = data.Data[exchange.value].instruments;

    const symbols = Object.entries(instruments).map(([key, contract]) => {
      const { INSTRUMENT_MAPPING: { QUOTE_CURRENCY, INDEX_UNDERLYING } } = contract;

      const type = contract.MAPPED_INSTRUMENT.includes('INVERSE') ? 'inverse' : 'linear';
      return {
        symbol: contract.INSTRUMENT,
        short: key,
        full_name: `${exchange.value}:${key}`,
        description: `${contract.INSTRUMENT}`,
        exchange: exchange.value,
        exchange_logo: 'https://s3-symbol-logo.tradingview.com/provider/bybit.svg',
        type,
        logo_urls: [
            `https://s3-symbol-logo.tradingview.com/crypto/XTVC${INDEX_UNDERLYING}.svg`,
            `https://s3-symbol-logo.tradingview.com/crypto/XTVC${QUOTE_CURRENCY}.svg`,
          ],
      };
    });

    allSymbols = [...allSymbols, ...symbols];
  }
  return allSymbols;
}

export default {
  onReady: (callback) => {
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
    const symbols = await getAllSymbols();

    const newSymbols = symbols.filter((symbol) => {
      const isExchangeValid = exchange === '' || symbol.exchange === exchange;
      const isFullSymbolContainsInput = symbol.symbol.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
      return isExchangeValid && isFullSymbolContainsInput && (symbol.type === symbolType || !symbolType);
    });

    onResultReadyCallback(newSymbols);
  },

  resolveSymbol: async (symbolName, onSymbolResolvedCallback, onResolveErrorCallback, extension) => {
    const symbols = await getAllSymbols();
    const symbolItem = symbols.find(({ full_name }) => full_name === symbolName) as any;

    if (!symbolItem) {
      onResolveErrorCallback('cannot resolve symbol');
      return;
    }

    // override current url with parameters of new symbol
    let currentUrl = window.location.href;
    let url = new URL(currentUrl);
    url.searchParams.set('symbol', symbolItem.short);
    window.history.pushState({}, '', url);

    // Symbol information object
    const symbolInfo = {
      ticker: symbolItem.full_name,
      name: symbolItem.symbol,
      description: symbolItem.description,
      type: symbolItem.type,
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: symbolItem.exchange,
      minmov: 1,
      logo_urls: symbolItem.logo_urls?.reverse(),
      pricescale: 100,
      has_intraday: true,
      has_daily: true,
      // intraday_multipliers: ['1', '60'],
      // has_no_volume: true,
      has_weekly_and_monthly: false,
      supported_resolutions: configurationData.supported_resolutions,
      volume_precision: 2,
      data_status: 'streaming',
    };

    onSymbolResolvedCallback(symbolInfo);
  },

  getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    const { from, to, firstDataRequest } = periodParams;

    const interval = resolution.replace(/\d+(?=[A-Za-z])/g, '');

    let urlParameters = {
      category: symbolInfo.type,
      symbol: symbolInfo.name,
      interval,
      limit: 2000, // max
    };

    const query = Object.keys(urlParameters)
      .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
      .join('&');

      console.log(query);
      

    try {
      const data = await makeApiRequestBybit(`/v5/market/kline?${query}`);

      if (!data || !data.result || !data.result.list?.length) {
        onHistoryCallback([], { noData: true });
        return;
      }

      const list = data.result.list;
      const bars = list.reverse().map((bar) => ({
        time: +bar[0],
        open: +bar[1],
        high: +bar[2],
        low: +bar[3],
        close: +bar[4],
        volume: +bar[5],
      }));

      if (firstDataRequest) {
        lastBarsCache.set(symbolInfo.full_name, { ...bars[bars.length - 1] });
      }

      onHistoryCallback(bars, { noData: false });
    } catch (error) {
      console.error('Error fetching or processing data:', error);
      onErrorCallback(error);
    }
  },

  // calculateHistoryDepth: (resolution, resolutionBack, intervalBack) => {
  //   //optional
  //   console.log('=====calculateHistoryDepth running');

  //   // while optional, this makes sure we request 24 hours of minute data at a time
  //   // CryptoCompare's minute data endpoint will throw an error if we request data beyond 7 days in the past, and return no data
  //   return resolution < 60 ? { resolutionBack: '1', intervalBack: '1000' } : undefined;
  // },

  getServerTime: (cb) => {
    console.log('=====getServerTime running');
  },

  subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) => {
    subscribeOnStream(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
      lastBarsCache.get(symbolInfo.full_name),
      symbolInfo.type
    );
  },

  unsubscribeBars: (subscriberUID) => {
    unsubscribeFromStream(subscriberUID);
  },
};
