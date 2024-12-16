import { create } from 'zustand';
import { type bybit } from 'ccxt';
import { persist } from 'zustand/middleware';

export interface ApiStateProps {
  fees: { maker: number | null; taker: number | null };
  setFees: (fees: { maker: number | null; taker: number | null }) => void;

  apiMinOrderSize: null | string;
  apiMaxOrderSize: null | string;
  setApiMinOrderSize: (apiMinOrderSize: string) => void;
  setApiMaxOrderSize: (apiMaxOrderSize: string) => void;

  apiLeverage: number | null;
  apiLeverageMax: number | null;
  apiLeverageStepSize: number | null;
  setApiLeverage: (apiLeverage: number | null) => void;
  setApiLeverageMax: (apiLeverageMax: number | null) => void;
  setApiLeverageStepSize: (apiLeverageStepSize: number | null) => void;

  startBalanceToday: number | null;
  setStartBalanceToday: (startBalanceToday: number | null) => void;
  startDate: number | null;
  setStartDate: () => void;

  tradingPair: string;
  primaryPair: string;
  tradingPairFormatted: () => string;
  counterAsset: string;
  setTradingPair: (tradingPair: string) => void;

  brokerInstance: bybit | null;
  setBrokerInstance: (brokerInstance: bybit | null) => void;
}

export const ApiState = create<ApiStateProps>()(
  persist(
    (set, get) => ({
      fees: { maker: null, taker: null },
      setFees: (fees) => set({ fees }),

      apiMinOrderSize: null,
      apiMaxOrderSize: null,
      setApiMinOrderSize: (apiMinOrderSize) => set({ apiMinOrderSize }),
      setApiMaxOrderSize: (apiMaxOrderSize) => set({ apiMaxOrderSize }),

      apiLeverage: null,
      apiLeverageMax: null,
      apiLeverageStepSize: null,
      setApiLeverage: (apiLeverage) => set({ apiLeverage }),
      setApiLeverageMax: (apiLeverageMax) => set({ apiLeverageMax }),
      setApiLeverageStepSize: (apiLeverageStepSize) => set({ apiLeverageStepSize }),

      startBalanceToday: null,
      setStartBalanceToday: (startBalanceToday) => set({ startBalanceToday }),
      startDate: null,
      setStartDate: () => set({ startDate: new Date().setHours(0, 0, 0, 0) }),

      tradingPair: 'BTC-USDT-VANILLA-PERPETUAL',
      tradingPairFormatted: () => {
        const { tradingPair } = get();

        const tradingPairArr = tradingPair.split('-');
        return `${tradingPairArr[0]}${tradingPairArr[1]}`;
      },
      primaryPair: 'BTC',
      counterAsset: 'USDT',
      setTradingPair: (tradingPair) =>
        set({
          tradingPair,
          primaryPair: tradingPair.split('-')[0],
          counterAsset: tradingPair.split('-')[1],
        }),

      brokerInstance: null,
      setBrokerInstance: (brokerInstance) => set({ brokerInstance }),
    }),
    {
      name: 'api-storage',
      partialize: (state) => ({
        startBalanceToday: state.startBalanceToday,
        startDate: state.startDate,
      }),
    }
  )
);
