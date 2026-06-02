import { PolymarketClient } from './clobClient.js';
import { OrderBookAnalyzer } from './orderBookAnalyzer.js';
import { BotConfig } from './types.js';

const TOKEN_UP = process.env.TOKEN_UP_ID || '71231026916053923915349866098648444122331797713776259432110173290233557727071';
const TOKEN_DOWN = process.env.TOKEN_DOWN_ID || '41817345880227474970944976653821165626933314465464164370630526034932640564253';

export class TradingStrategy {
  private client: PolymarketClient;
  private analyzer: OrderBookAnalyzer;
  private config: BotConfig;
  private lastAction: number = 0;
  private cooldownMs: number = 30000;
  
  constructor(client: PolymarketClient, config: BotConfig) {
    this.client = client;
    this.analyzer = new OrderBookAnalyzer(5);
    this.config = config;
  }
  
  async execute(): Promise<void> {
    try {
      const bookUp = await this.client.getOrderBook(TOKEN_UP);
      await this.client.getOrderBook(TOKEN_DOWN);
      
      const pressure = this.analyzer.analyze(bookUp);
      this.analyzer.calculateVWAP(bookUp);
      const currentPrice = await this.client.getMarketPrice(TOKEN_UP);
      
      console.log(`[${new Date().toISOString()}] Signal: ${pressure.signal}, Ratio: ${pressure.ratio.toFixed(2)}, Price: ${currentPrice.toFixed(3)}`);
      
      const now = Date.now();
      if (now - this.lastAction < this.cooldownMs) return;
      
      if (pressure.signal === 'BULLISH' && currentPrice < 0.65) {
        await this.client.placeMarketOrder(TOKEN_UP, 0 as any, this.config.tradeSize);
        this.lastAction = now;
      } else if (pressure.signal === 'BEARISH' && currentPrice > 0.35) {
        await this.client.placeMarketOrder(TOKEN_DOWN, 0 as any, this.config.tradeSize);
        this.lastAction = now;
      }
    } catch (error) {
      console.error('Strategy execution error:', error);
    }
  }
}