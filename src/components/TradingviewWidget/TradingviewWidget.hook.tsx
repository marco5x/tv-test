import { useEffect, useRef } from 'react';
import { ApiState } from '../../states/index';

export const useTradingViewWidgetHooks = ( ) => {
  
  const { ...apiStateProps } = ApiState();

  const apiStatePropsRef = useRef(apiStateProps);

  useEffect(() => {
    apiStatePropsRef.current = apiStateProps;
  }, [apiStateProps]);

  const onSymbolChange = async () => {

    let currentUrl = window.location.href;
    let url = new URL(currentUrl);
    const symbolQuery = url.searchParams.get('symbol');
    await apiStatePropsRef.current.setTradingPair(`${symbolQuery}`);
  };

  return {
    onSymbolChange,
  };
};
