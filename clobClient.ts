export interface OrderBook {
  bids: [string, string][];
  asks: [string, string][];
}

export interface MarketPressure {
  signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  ratio: number;
  bidVolume: number;
  askVolume: number;
}

export interface BotConfig {
  tradeSize: number;
  maxSpread: number;
  updateIntervalMs: number;
}