import React from 'react';
import TradingViewEmbed from 'react-typescript-tradingview-embed';

const TVEmbedChart = () => (
  <div style={{ background: 'rgba(0, 0, 0, 0.85)' }}>
    <TradingViewEmbed
    // widgetType={widgetType.ADVANCED_CHART}
    // widgetConfig={{
    //   colorTheme: 'dark',
    //   symbol: 'BITMEX:XBTUSD',
    //   width: '100%',
    // }}
    />
    <TradingViewEmbed
    // widgetType={widgetType.SCREENER_CRYPTOCURRENCY}
    // widgetConfig={{
    //   colorTheme: 'dark',
    //   width: '100%',
    //   height: '230',
    // }}
    />
    <TradingViewEmbed
    // widgetType={widgetType.TICKER_TAPE}
    // widgetConfig={{
    //   colorTheme: 'light',
    //   autosize: true,
    // }}
    />
  </div>
);

export default TVEmbedChart;
