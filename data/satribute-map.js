// Satribute mapping for OrdiMutants
// Based on Magic Eden filter counts

const satributes = {
  // Count: 2206 - these are the most common, need to be calculated from inscription numbers
};

// Rarity tiers (for reference from CSV):
// mythic: ranks 1-25 (1/1s)
// legendary: ranks 26-112 (OGs)
// epic: ranks 113-333 
// rare: ranks 334-1111
// uncommon: ranks 1112-1666
// common: ranks 1667-2226

// Since we can't calculate satributes without fetching each inscription's sat number,
// we'll need to use the Magic Eden filter approach

// For now, let me create a mapping using the counts from ME filters:
// Common: 2206 (all non-rare sats)
// Vintage: 637
// Silk Road: 484  
// Hitman: 415
// Pizza: 407
// JPEG: 258
// Block 666: 226
// Nakamoto: 224
// First Transaction: 133
// Block 9: 133
// Block 286: 91
// Black Uncommon: 16
// Palindrome: 9
// Omega: 9
// Alpha: 5
// Uncommon: 4
// Block 78: 4
// Paliblock Palindrome: 2
// Block 9 450x: 1

// The user wants to see the SATRIBUTE badges on each mutant card
// I'll add the satribute field to the mock data for now

// For demo, let's add satribute to each mutant and update the display
