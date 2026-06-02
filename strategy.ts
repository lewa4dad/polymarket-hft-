import { OrderBook, MarketPressure } from './types.js';

export class OrderBookAnalyzer {
  private depth: number;
  
  constructor(depth: number = 5) {
    this.depth = depth;
  }
  
  analyze(orderBook: OrderBook): MarketPressure {
    const bids = orderBook.bids.slice(0, this.depth);
    const asks = orderBook.asks.slice(0, this.depth);
    
    let bidVolume = 0;
    let askVolume = 0;
    
    for (const bid of bids) bidVolume += parseFloat(bid[1]);
    for (const ask of asks) askVolume += parseFloat(ask[1]);
    
    const ratio = bidVolume / askVolume;
    let signal: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    
    if (ratio > 1.5) signal = 'BULLISH';
    else if (ratio < 0.67) signal = 'BEARISH';
    else signal = 'NEUTRAL';
    
    return { signal, ratio, bidVolume, askVolume };
  }
  
  calculateVWAP(orderBook: OrderBook): number {
    let totalValue = 0;
    let totalVolume = 0;
    
    for (const ask of orderBook.asks.slice(0, 10)) {
      const price = parseFloat(ask[0]);
      const volume = parseFloat(ask[1]);
      totalValue += price * volume;
      totalVolume += volume;
    }
    
    return totalVolume > 0 ? totalValue / totalVolume : 0;
  }
}