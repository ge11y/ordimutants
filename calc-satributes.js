// Calculate satributes for all mutants from inscription numbers
const fs = require('fs');

// Read rarity CSV
const csv = fs.readFileSync('/Users/goobbotv3/.openclaw/media/inbound/3f6a7d8d637919259e1869c8f67339af---6eab2cd6-7695-4e0a-9585-e4c99444c0e7.csv', 'utf8');

// Parse CSV
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');
const mutants = [];

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].match(/(".*?"|[^,]+)/g) || [];
  if (values.length < 7) continue;
  
  const row = {};
  headers.forEach((h, idx) => {
    row[h.trim()] = values[idx]?.replace(/^"|"$/g, '').trim();
  });
  mutants.push(row);
}

console.log(`Parsed ${mutants.length} mutants from CSV`);

// Extract inscription number from ID (e.g., "02a19275c279b61423ba50933ea2778110d3959806f0f85259a6e96eea0a7b21i0" -> sat number is 0 + that hex? No wait.

// Actually inscription IDs are base62 encoded. Let me check one:
// From earlier curl: inscription 02a19275c279b61423ba50933ea2778110d3959806f0f85259a6e96eea0a7b21i0 -> sat 45536076390

// So I need to use ordinals.com to get sat for each. Let me use a batch approach with the scraper.
console.log("Need to fetch sat numbers from ordinals.com...");

// Actually, let's try a simpler approach - use ordinals.com API
const https = require('https');

function getSatFromOrdinals(inscriptionId) {
  return new Promise((resolve) => {
    https.get(`https://ordinals.com/inscription/${inscriptionId}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/sat\/(\d+)/);
        resolve(match ? parseInt(match[1]) : null);
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  const results = [];
  
  for (let i = 0; i < Math.min(mutants.length, 50); i++) {
    const m = mutants[i];
    const sat = await getSatFromOrdinals(m.id);
    if (sat) {
      results.push({ id: m.id, name: m.name, sat, rank: m.rank, rarity_score: m.rarity_score, status: m.status });
    }
    console.log(`${i+1}/${Math.min(mutants.length, 50)}: ${m.name} -> sat ${sat}`);
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log(`\nGot ${results.length} sat numbers`);
  fs.writeFileSync('/Users/goobbotv3/.openclaw/workspace/ordimutants/data/sat_test.json', JSON.stringify(results, null, 2));
}

main();
