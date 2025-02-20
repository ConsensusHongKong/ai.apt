import { MerkleClient, MerkleClientConfig } from "@merkletrade/ts-sdk";
import { useEffect } from "react";


let merkleClientInstance: MerkleClient | null = null;



// initialize clients
const initMerkleClient = async () => {
    if (merkleClientInstance) {
      return { merkle: merkleClientInstance };
    }
    const merkle = new MerkleClient(await MerkleClientConfig.testnet());
    merkleClientInstance = merkle;
    return { merkle };
}


export const subscribePriceFeed = async (pairId: string, onPriceUpdate: (price: any) => void) => {
  try {
    const { merkle } = await initMerkleClient();
    const session = await merkle.connectWsApi();
    console.log("Connected to Websocket API");
    const priceFeed = session.subscribePriceFeed(pairId);
    console.log("Subscribed to price feed for", pairId);
    for await (const price of priceFeed) {
      onPriceUpdate(price);
    }
  } catch (error) {
    console.error(`subscribe to price feed for ${pairId}:`, error);
  }
}




