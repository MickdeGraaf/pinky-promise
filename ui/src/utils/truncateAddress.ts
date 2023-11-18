export const truncateAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
    if (!address || address.length < startChars + endChars) {
      return address; // Return the original address if it's too short
    }
  
    const truncatedAddress = `${address.substring(0, startChars)}...${address.slice(-endChars)}`;
    return truncatedAddress;
}