// Define interface types
interface PriceQuery {
  tokenAddress: string;
}

interface PriceResponse {
  price: number;
  // Add other fields based on actual response data
}

const API_ENDPOINT = "https://api.panora.exchange/prices";
const API_KEY = "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi";

async function fetchTokenPrice(tokenAddress: string): Promise<PriceResponse> {
  const query: PriceQuery = {
    tokenAddress,
  };

  const queryString = new URLSearchParams();
  queryString.append("tokenAddress", tokenAddress);
  const url = `${API_ENDPOINT}?${queryString}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch token price:", error);
    throw error;
  }
}

// Usage example:
// const aptosPrice = await fetchTokenPrice("0x1::aptos_coin::AptosCoin");
