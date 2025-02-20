export const formatMarketCoinValues = (data: number) => {
    const formattedData = data / 1e6;
    return formattedData.toString();
}

export function shortenAddress(address: string): string {
    // Check if the address is short enough to not need shortening
    if (address.length <= 10) {
        return address; // If the address is already short, return it as is
    }
    // Extract the first 6 characters and the last 4 characters of the address, joining them with '...'
    const start = address.slice(0, 6); // For example: "0x1234"
    const end = address.slice(-4); // For example: "4567"
    
    // Return the shortened address in the format: 0x1234...5678
    return `${start}...${end}`;
}

