import { ClobClient, ApiCreds, Side, OrderType } from '@polymarket/clob-client';
import dotenv from 'dotenv';

dotenv.config();

export class PolymarketClient {
  private client: ClobClient;
  
  constructor() {
    const creds: ApiCreds = {
      key: process.env.CLOB_API_KEY!,
      secret: process.env.CLOB_API_SECRET!,
      passphrase: process.env.CLOB_API_PASSPHRASE!
    };
    
    this.client = new ClobClient(
      process.env.CLOB_HOST!,
      parseInt(process.env.CHAIN_ID!),
      process.env.PRIVATE_KEY!,
      creds
    );
  }
  
  async initialize(): Promise<void> {
    await this.client.createOrDeriveApiCreds();
    console.log('CLOB client initialized');
  }
  
  async getOrderBook(tokenId: string): Promise<any> {
    return await this.client.getOrderBook(tokenId);
  }
  
  async placeMarketOrder(tokenId: string, side: Side, size: number): Promise<any> {
    try {
      const order = await this.client.createMarketOrder(tokenId, side, size);
      const resp = await this.client.postOrder(order);
      console.log(`Order placed: ${side} ${size} of ${tokenId}`);
      return resp;
    } catch (error) {
      console.error('Order failed:', error);
      return null;
    }
  }
  
  async getMarketPrice(tokenId: string): Promise<number> {
    const book = await this.getOrderBook(tokenId);
    if (book.bids.length === 0 || book.asks.length === 0) return 0.5;
    const bestBid = parseFloat(book.bids[0][0]);
    const bestAsk = parseFloat(book.asks[0][0]);
    return (bestBid + bestAsk) / 2;
  }
}