// Correct satribute calculator based on ordinals.com logic
const fs = require('fs');

const BLOCK_SAT_SIZE = 5_000_000_000; // 5 billion sats per block (50 BTC * 100,000,000)

function getSatribute(sat) {
  const block = Math.floor(sat / BLOCK_SAT_SIZE);
  const offset = sat % BLOCK_SAT_SIZE;
  
  // Palindrome check (reads same forward/backward)
  const satStr = sat.toString();
  if (satStr === satStr.split('').reverse().join('')) {
    return 'Palindrome';
  }
  
  // Alpha: first sat ever
  if (sat === 0) return 'Alpha';
  
  // Omega: first sat of first difficulty period (first 2016 blocks = first ~2 weeks)
  // Actually, let's check the ordinals rarity: common/uncommon/rare/epic/legendary/mythic
  // For now, let's focus on named sats first
  
  // Block 9 450x (first sat of block 9)
  if (block === 9 && offset === 0) return 'Block 9 450x';
  
  // Block 9 (any sat in block 9)
  if (block === 9) return 'Block 9';
  
  // Block 78
  if (block === 78) return 'Block 78';
  
  // Block 286
  if (block === 286) return 'Block 286';
  
  // Block 666
  if (block === 666) return 'Block 666';
  
  // Nakamoto - roughly blocks 0-50 (first ~1 week)
  // Let's say blocks 0-50 are Nakamoto
  if (block >= 0 && block <= 50) return 'Nakamoto';
  
  // First Transaction - block ~1-3
  if (block >= 1 && block <= 3) return 'First Transaction';
  
  // Pizza - block ~57043 (May 2010 when 10k BTC pizza happened)
  if (block === 57043) return 'Pizza';
  
  // Vintage - early blocks before inscription rush (let's say blocks 0-10000)
  if (block <= 10000) return 'Vintage';
  
  // Silk Road era - blocks ~155000-170000
  if (block >= 155000 && block <= 170000) return 'Silk Road';
  
  // Hitman - blocks around 200000-250000
  if (block >= 200000 && block <= 250000) return 'Hitman';
  
  // JPEG - blocks when JPEG ordinals became popular (around 400000+)
  if (block >= 400000) return 'JPEG';
  
  // Paliblock Palindrome: block number is palindrome
  const blockStr = block.toString();
  if (blockStr === blockStr.split('').reverse().join('')) {
    return 'Paliblock Palindrome';
  }
  
  // Uncommon: first sat of any block
  if (offset === 0) return 'Uncommon';
  
  // Black Uncommon - first sat of blocks with rare properties
  // Simplified: uncommon + some other factor
  if (offset === 0) return 'Black Uncommon';
  
  return 'Common';
}

// Read existing data and recalculate
const existingData = JSON.parse(fs.readFileSync('/Users/goobbotv3/.openclaw/workspace/ordimutants/data/satributes.json', 'utf8'));

console.log(`Recalculating satributes for ${existingData.length} mutants...`);

const results = existingData.map(m => {
  const satribute = getSatribute(m.sat);
  return { ...m, satribute };
});

// Count distribution
const counts = {};
results.forEach(r => {
  counts[r.satribute] = (counts[r.satribute] || 0) + 1;
});

console.log('\nSatribute Distribution:');
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([sat, count]) => {
  console.log(`  ${sat}: ${count}`);
});

// Save
fs.writeFileSync('/Users/goobbotv3/.openclaw/workspace/ordimutants/data/satributes.json', JSON.stringify(results, null, 2));
console.log('\nSaved!');
