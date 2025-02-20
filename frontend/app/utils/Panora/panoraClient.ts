import Panora from "@panoraexchange/swap-sdk"

const API_KEY = process.env.NEXT_PUBLIC_PANORA_API_KEY || 
  "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi"

class PanoraClientWrapper {
  private static instance: Panora | null = null;
  
  public static getInstance(): Panora {
    if (!this.instance) {
      try {
        this.instance = new Panora({ apiKey: API_KEY });
      } catch (error) {
        console.error('Failed to initialize Panora client:', error);
        throw error;
      }
    }
    return this.instance;
  }
}

const panoraClient = PanoraClientWrapper.getInstance();

export default panoraClient;
