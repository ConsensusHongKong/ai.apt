import Panora, { PanoraConfig } from "@panoraexchange/swap-sdk";

type HexAddress = `0x${string}`;


const TO_WALLET_ADDRESS = process.env.NEXT_PUBLIC_SPOT_TO_WALLET_ADDRESS as HexAddress;
const INTEGRATOR_FEE_ADDRESS = process.env.NEXT_PUBLIC_SPOT_INTEGRATOR_FEE_ADDRESS as HexAddress;

const config: PanoraConfig = {
  apiKey: "YOUR_API_KEY",
};

const client = new Panora(config);

// Grid trading parameters
const GRID_SIZE = 10; // Number of grid levels
const GRID_SPACING = 0.01; // Price spacing between grid levels (e.g., 1%)
const INITIAL_AMOUNT = 0.1; // Initial trading amount (in WBTC)
const SLIPPAGE = "1"; // Allowed slippage percentage
const INTEGRATOR_FEE_PERCENTAGE = "1"; // Integrator fee percentage
// const TO_WALLET_ADDRESS = "YOUR_WALLET_ADDRESS";

// Risk assessment parameters
const MAX_LOSS_PERCENTAGE = 0.05; // Maximum acceptable loss percentage
const VOLATILITY_THRESHOLD = 0.02; // Price volatility threshold (2%)

// Function to get the current price of WBTC/USDC
const getCurrentPrice = async () => {
  // Here you can call a price oracle or other API to get the current price
  return 95000; // Assume the current price is 95000 USDC
};

// Function to assess risk based on price volatility and potential loss
const assessRisk = async (currentPrice: number) => {
  // Simulate fetching historical prices for volatility calculation
  const historicalPrices = [49000, 49500, 50500, 51000, 52000]; // Example historical prices
  const priceChanges = historicalPrices.map((price) => Math.abs(price - currentPrice) / currentPrice);
  
  // Calculate volatility as the average of price changes
  const averageVolatility = priceChanges.reduce((acc, change) => acc + change, 0) / priceChanges.length;

  // Check if the average volatility exceeds the threshold
  if (averageVolatility > VOLATILITY_THRESHOLD) {
    console.warn("High volatility detected! Consider reducing trade size or pausing trading.");
  }

  // Calculate potential loss based on the current price
  const potentialLoss = (currentPrice * INITIAL_AMOUNT) * MAX_LOSS_PERCENTAGE;
  console.log(`Potential loss for this trade: ${potentialLoss} USDC`);

  // Return risk assessment results
  return {
    highVolatility: averageVolatility > VOLATILITY_THRESHOLD,
    potentialLoss,
  };
};

// Function to execute grid trading
const executeGridTrading = async () => {
  const currentPrice = await getCurrentPrice();
  
  // Assess risk before executing trades
  const riskAssessment = await assessRisk(currentPrice);
  
  if (riskAssessment.highVolatility) {
    console.log("Risk is high, consider adjusting your strategy.");
    return; // Exit if risk is too high
  }

  for (let i = 0; i < GRID_SIZE; i++) {
    const priceLevel = currentPrice * (1 + (i * GRID_SPACING));
    
    // Perform WBTC to USDC swap
    await client.Swap(
      {
        chainId: "1",
        fromTokenAddress: "0x1::aptos_coin::AptosCoin", // WBTC address
        toTokenAddress: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC", // USDC address
        fromTokenAmount: INITIAL_AMOUNT.toString(),
        toWalletAddress: TO_WALLET_ADDRESS,
        slippagePercentage: SLIPPAGE,
        integratorFeeAddress: INTEGRATOR_FEE_ADDRESS,
        integratorFeePercentage: INTEGRATOR_FEE_PERCENTAGE,
      },
      "YOUR_PRIVATE_KEY"
    );

    console.log(`Executed swap at price level: ${priceLevel}`);
  }
};

// Start grid trading
executeGridTrading().catch(console.error);

