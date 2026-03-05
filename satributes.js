// OrdiMutants Satribute Calculator
// Based on inscription numbers (sat indices)

// Block definitions
const BLOCKS_PER_CYCLE = 6;
const BLOCKS_PER_EPOCH = 210000;  // Halving epoch
const BLOCKS_PER_DA = 2016;  // Difficulty adjustment

// Special named sats
const SPECIAL_SATS = {
  // Genesis
  0: 'Alpha',
  
  // Block 9 (first refinable)
  9: 'Block 9',
  450: 'Block 9 450x',  // First sat of block 9, worth 4500sats
  
  // Block 78
  78: 'Block 78',
  
  // Block 286
  286: 'Block 286',
  
  // Block 666
  666: 'Block 666',
  
  // First transaction (block 170)
  170: 'First Transaction',
  
  // Pizza (May 22, 2010 - block 57043)
  // 10,000 BTC used to buy pizzas
  57043: 'Pizza',
  
  // Silk Road era (block ~155000-170000)
  // Not precise, just a range marker
  
  // Nakamoto (Satoshi's first blocks - around block 0-50)
  // Nakamoto collection: sats from early blocks
  
  // Vintage: first sat of any block (before block 20000 approx)
  // Hitman: sats from specific block ranges
  // JPEG: from when jpeg ordinals started being popular
  // Palindrome: rare numeric patterns
  // Omega: very early sats
  // Black Uncommon: first sat of blocks with black in hash
};

// Calculate which epoch (halving period) - Legendary tier
function getEpoch(sat) {
  return Math.floor(sat / (BLOCKS_PER_EPOCH * 100));
}

// Calculate difficulty adjustment period - Epic tier  
function getDAPeriod(sat) {
  return Math.floor(sat / (BLOCKS_PER_DA * 100));
}

// Calculate cycle - Rare tier
function getCycle(sat) {
  return Math.floor(sat / (BLOCKS_PER_CYCLE * 100));
}

// Calculate block
function getBlock(sat) {
  return Math.floor(sat / 100);
}

// Calculate position in block (0-99)
function getPositionInBlock(sat) {
  return sat % 100;
}

function getSatribute(inscriptionNumber) {
  const sat = inscriptionNumber;
  const block = getBlock(sat);
  const pos = getPositionInBlock(sat);
  
  // Check special named sats first
  if (SPECIAL_SATS[block]) {
    return SPECIAL_SATS[block];
  }
  
  // Palindrome check (rare - sat number reads same forward/backward)
  const satStr = sat.toString();
  if (satStr === satStr.split('').reverse().join('')) {
    return 'Palindrome';
  }
  
  // Black Uncommon: uncommon sats where block hash has 'black' pattern
  // Simplified: first sat of blocks that are notable
  
  // Alpha: sat 0
  if (sat === 0) return 'Alpha';
  
  // Omega: first sat of first difficulty period
  if (sat < BLOCKS_PER_DA * 100) return 'Omega';
  
  // Block 9 450x: first sat of block 9
  if (block === 9 && pos === 0) return 'Block 9 450x';
  
  // Block 9: other sats in block 9
  if (block === 9) return 'Block 9';
  
  // Block 78
  if (block === 78) return 'Block 78';
  
  // Block 286
  if (block === 286) return 'Block 286';
  
  // Block 666
  if (block === 666) return 'Block 666';
  
  // First Transaction: block ~170
  if (block === 170) return 'First Transaction';
  
  // Paliblock Palindrome: palindrome + block number
  const blockStr = block.toString();
  if (blockStr === blockStr.split('').reverse().join('')) {
    return 'Paliblock Palindrome';
  }
  
  // Legendary: first sat of epoch (halving period)
  const currentEpoch = getEpoch(sat);
  const epochStartSat = currentEpoch * BLOCKS_PER_EPOCH * 100;
  if (sat === epochStartSat) return 'Legendary'; // But we use custom names
  
  // Epic: first sat of difficulty adjustment
  const daPeriod = getDAPeriod(sat);
  const daStartSat = daPeriod * BLOCKS_PER_DA * 100;
  if (sat === daStartSat) return 'Epic';
  
  // Rare: first sat of cycle
  const cycle = getCycle(sat);
  const cycleStartSat = cycle * BLOCKS_PER_CYCLE * 100;
  if (sat === cycleStartSat) return 'Rare';
  
  // Uncommon: first sat of block
  const blockStartSat = block * 100;
  if (sat === blockStartSat) return 'Uncommon';
  
  // Common: everything else
  return 'Common';
}

// Load mutant data and calculate satributes
const fs = require('fs');

async function main() {
  // Read from Magic Eden to get inscription numbers
  // For now, use range: 76393049 to 106549181
  
  const startSat = 76393049;
  const endSat = 106549181;
  const total = endSat - startSat + 1;
  
  console.log(`Calculating satributes for ${total} inscriptions...`);
  console.log(`Range: ${startSat} to ${endSat}`);
  console.log('');
  
  const satributes = {};
  
  for (let sat = startSat; sat <= endSat; sat++) {
    const satribute = getSatribute(sat);
    if (!satributes[satribute]) {
      satributes[satribute] = [];
    }
    satributes[satribute].push(sat);
  }
  
  // Print summary
  console.log('Satribute Distribution:');
  for (const [sat, sats] of Object.entries(satributes).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${sat}: ${sats.length}`);
  }
  
  // Save to file
  fs.writeFileSync('/Users/goobbotv3/.openclaw/workspace/ordimutants/data/satributes.json', 
    JSON.stringify(satributes, null, 2));
  console.log('\nSaved to data/satributes.json');
}

main().catch(console.error);
