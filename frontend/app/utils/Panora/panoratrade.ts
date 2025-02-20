import panoraclient from "./panoraClient";


const initializePanoraClient = () => {
  return panoraclient;
}


type HexAddress = `0x${string}`;

const TO_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SPOT_TO_WALLET_ADDRESS as HexAddress;
const INTEGRATOR_FEE_ADDRESS = process.env.NEXT_PUBLIC_SPOT_INTEGRATOR_FEE_ADDRESS as HexAddress;

/**
 * Executes a swap with exact input amount
 * @param {string} chainId - The ID of the blockchain (e.g., "1" for Aptos)
 * @param {string} fromTokenAddress - The address of the token to swap from
 * @param {string} toTokenAddress - The address of the token to swap to
 * @param {string} fromTokenAmount - The amount of the token to swap from
 * @param {string} toWalletAddress - The wallet address to send the swapped tokens to
 * @param {string} slippagePercentage - The allowed slippage percentage for the swap
 * @param {string} integratorFeeAddress - The address to receive the integrator fee
 * @param {string} integratorFeePercentage - The percentage of the integrator fee
 * @returns Response from the swap operation
 */
export const exactInSwap = async (
    chainId: string,
    fromTokenAddress: HexAddress,
    toTokenAddress: HexAddress,
    fromTokenAmount: string,
    toWalletAddress: HexAddress,
    slippagePercentage: string,
    integratorFeeAddress: HexAddress,
    integratorFeePercentage: string,
) => {
    const client = initializePanoraClient();
    const response = await client.Swap(
        {
          chainId,
          fromTokenAddress,
          toTokenAddress,
          fromTokenAmount,
          toWalletAddress,
          slippagePercentage,
          integratorFeeAddress,
          integratorFeePercentage,
        },
        "YOUR PRIVATE KEY"
    )
}


/**
 * Executes a swap with exact output amount
 * @param {string} chainId - The ID of the blockchain (e.g., "1" for Aptos)
 * @param {string} fromTokenAddress - The address of the token to swap from
 * @param {string} toTokenAddress - The address of the token to swap to
 * @param {string} fromTokenAmount - The amount of the token to swap from
 * @param {string} toWalletAddress - The wallet address to send the swapped tokens to
 * @param {string} slippagePercentage - The allowed slippage percentage for the swap
 * @param {string} integratorFeeAddress - The address to receive the integrator fee
 * @param {string} integratorFeePercentage - The percentage of the integrator fee
 * @returns Response from the swap operation
 */
export const exactOutSwap = async (
    chainId: string,
    fromTokenAddress: HexAddress,
    toTokenAddress: HexAddress,
    fromTokenAmount: string,
    toWalletAddress: HexAddress,
    slippagePercentage: string,
    integratorFeeAddress: HexAddress,
    integratorFeePercentage: string,
) => {
    const client = initializePanoraClient();
    const response = await client.Swap(
        {
          chainId,
          fromTokenAddress,
          toTokenAddress,
          fromTokenAmount,
          toWalletAddress,
          slippagePercentage,
          integratorFeeAddress,
          integratorFeePercentage,
        },
        "YOUR PRIVATE KEY"
    )
}



/**
 * Executes a swap with exact output amount
 * @param {string} chainId - The ID of the blockchain (e.g., "1" for Aptos)
 * @param {string} fromTokenAddress - The address of the token to swap from
 * @param {string} toTokenAddress - The address of the token to swap to
 * @param {string} fromTokenAmount - The amount of the token to swap from
 * @param {string} toWalletAddress - The wallet address to send the swapped tokens to
 * @param {string} slippagePercentage - The allowed slippage percentage for the swap
 * @param {string} integratorFeeAddress - The address to receive the integrator fee
 * @param {string} integratorFeePercentage - The percentage of the integrator fee
 * @returns Response from the swap operation
 */
/**
 * Executes multiple swaps in a single batch transaction
 * @param {string} chainId - The ID of the blockchain (e.g., "1" for Aptos)
 * @param {HexAddress} fromTokenAddress - The address of the token to swap from
 * @param {HexAddress} toTokenAddress - The address of the token to swap to
 * @param {string} fromTokenAmount - The amount of the token to swap from
 * @param {string} toTokenAmount - The amount of the token to swap from
 * @param {HexAddress} toWalletAddress - The wallet address to send the swapped tokens to
 * @param {string} slippagePercentage - The allowed slippage percentage for the swap
 * @param {HexAddress} integratorFeeAddress - The address to receive the integrator fee
 * @param {string} integratorFeePercentage - The percentage of the integrator fee
 * @returns Response from the batch swap operation
 */
export const exactInSwapBatch = async (
    chainId: string,
    fromTokenAddress: HexAddress,
    toTokenAddress: HexAddress,
    fromTokenAmount: string,
    toTokenAmount: string,
    toWalletAddress: HexAddress,
    slippagePercentage: string,
    integratorFeeAddress: HexAddress,
    integratorFeePercentage: string,
) => {
    const client = initializePanoraClient();
    const response = await client.BatchSwap(
        [
          {
            chainId,
            fromTokenAddress,
            toTokenAddress,
            fromTokenAmount,
            toWalletAddress,
            slippagePercentage,
            integratorFeeAddress,
            integratorFeePercentage,
          },
          {
            chainId,
            fromTokenAddress,
            toTokenAddress,
            toTokenAmount,
            toWalletAddress,
            slippagePercentage,
            integratorFeeAddress,
            integratorFeePercentage,
          },
        ],
        "YOUR PRIVATE KEY"
    )
}

/**
 * Executes a swap with exact input amount
 * @returns Response from the swap operation
 */
export const exactInSwapUse = async () => {
    const client = initializePanoraClient();
    const response = await client.Swap(
        {
          chainId: "1",
          fromTokenAddress: "0x1::aptos_coin::AptosCoin",
          toTokenAddress:
            "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
          fromTokenAmount: "1",
          toWalletAddress: TO_WALLET_ADDRESS,
          slippagePercentage: "1",
          integratorFeeAddress: INTEGRATOR_FEE_ADDRESS,
          integratorFeePercentage: "1",
        },
        "YOUR PRIVATE KEY"
    )
}

/**
 * Executes a swap with exact output amount
 * @returns Response from the swap operation
 */
export const exactOutSwapuse = async () => {
    const client = initializePanoraClient();
    const response = await client.Swap(
        {
          chainId: "1",
          fromTokenAddress: "0x1::aptos_coin::AptosCoin",
          toTokenAddress:
            "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
          toTokenAmount: "12",
          toWalletAddress: TO_WALLET_ADDRESS,
          slippagePercentage: "1",
          integratorFeeAddress: INTEGRATOR_FEE_ADDRESS,
          integratorFeePercentage: "1",
        },
        "YOUR PRIVATE KEY"
      )
}

/**
 * Executes multiple swaps in a single batch transaction
 * @returns Response from the batch swap operation
 */
export const exactInSwapBatchuse = async () => {
    const client = initializePanoraClient();
    const response = await client.BatchSwap(
        [
          {
            chainId: "1",
            fromTokenAddress: "0x1::aptos_coin::AptosCoin",
            toTokenAddress:
              "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
            fromTokenAmount: "1",
            toWalletAddress: TO_WALLET_ADDRESS,
            slippagePercentage: "1",
            integratorFeeAddress: INTEGRATOR_FEE_ADDRESS,
            integratorFeePercentage: "1",
          },
          {
            chainId: "1",
            fromTokenAddress: "0x1::aptos_coin::AptosCoin",
            toTokenAddress:
              "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
            toTokenAmount: "1",
            toWalletAddress: TO_WALLET_ADDRESS,
            slippagePercentage: "1",
            integratorFeeAddress: INTEGRATOR_FEE_ADDRESS,
            integratorFeePercentage: "1",
          },
        ],
        "YOUR PRIVATE KEY"
      )
}

/**
 * Gets a quote for a swap with exact input amount
 * @returns Quote response including price and transaction details
 */
export const exactInSwapQuote = async () => {
    const client = initializePanoraClient();
    const response = await client.SwapQuote({
        chainId: "1",
        fromTokenAddress: "0x1::aptos_coin::AptosCoin",
        toTokenAddress:
          "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
        fromTokenAmount: "1",
        toWalletAddress: TO_WALLET_ADDRESS,
        slippagePercentage: "1",
        integratorFeeAddress: INTEGRATOR_FEE_ADDRESS,
        integratorFeePercentage: "1",
        // "rawTransaction" | "transactionPayload" depending on the use case
        getTransactionData: "rawTransaction"
      })
}

/**
 * Gets a quote for a swap with exact output amount
 * @returns Quote response including price and transaction details
 */
export const exactOutSwapQuote = async () => {
    const client = initializePanoraClient();
    const response = await client.SwapQuote({
        chainId: "1",
        fromTokenAddress: "0x1::aptos_coin::AptosCoin",
        toTokenAddress:
          "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
        toTokenAmount: "1",
        toWalletAddress: TO_WALLET_ADDRESS,
        slippagePercentage: "1",
        integratorFeeAddress: INTEGRATOR_FEE_ADDRESS,
        integratorFeePercentage: "1",
      })
}
