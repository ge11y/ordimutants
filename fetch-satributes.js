// Batch fetch satributes with delays
const fs = require('fs');
const https = require('https');

const metadata = JSON.parse(fs.readFileSync('/Users/goobbotv3/.openclaw/workspace/ordimutants/data/metadata.json', 'utf8'));

function getSatFromOrdinals(id) {
  return new Promise((resolve) => {
    https.get(`https://ordinals.com/inscription/${id}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/sat\/(\d+)/);
        resolve(match ? parseInt(match[1]) : null);
      });
    }).on('error', () => resolve(null));
  });
}

function getSatribute(sat) {
  const block = Math.floor(sat / 100);
  const pos = sat % 100;
  
  if (sat === 0) return 'Alpha';
  if (sat < 201600) return 'Omega';
  if (block === 9 && pos === 0) return 'Block 9 450x';
  if (block === 9) return 'Block 9';
  if (block === 78) return 'Block 78';
  if (block === 286) return 'Block 286';
  if (block === 666) return 'Block 666';
  if (block === 170) return 'First Transaction';
  
  const satStr = sat.toString();
  if (satStr === satStr.split('').reverse().join('')) return 'Palindrome';
  
  const blockStr = block.toString();
  if (blockStr === blockStr.split('').reverse().join('')) return 'Paliblock Palindrome';
  
  if (pos === 0) return 'Uncommon';
  return 'Common';
}

async function main() {
  const results = [];
  const existingMap = new Map();
  try {
    const existingData = JSON.parse(fs.readFileSync('/Users/goobbotv3/.openclaw/workspace/ordimutants/data/satributes.json', 'utf8'));
    if (Array.isArray(existingData)) {
      existingData.forEach(e => existingMap.set(e.id, e));
      console.log(`Loaded ${existingMap.size} existing entries`);
    }
  } catch(e) {
    console.log('No existing data, starting fresh');
  }
  
  console.log(`Processing ${metadata.length} mutants...`);
  
  for (let i = 0; i < metadata.length; i++) {
    const m = metadata[i];
    const id = m.id;
    
    if (existingMap.has(id)) {
      results.push(existingMap.get(id));
      continue;
    }
    
    const sat = await getSatFromOrdinals(id);
    
    if (sat) {
      const satribute = getSatribute(sat);
      results.push({ id, name: m.meta.name, sat, satribute });
      console.log(`${i+1}/${metadata.length}: ${m.meta.name} -> sat ${sat} (${satribute})`);
    } else {
      console.log(`${i+1}/${metadata.length}: FAILED ${m.meta.name}`);
    }
    
    // Delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  
  fs.writeFileSync('/Users/goobbotv3/.openclaw/workspace/ordimutants/data/satributes.json', JSON.stringify(results, null, 2));
  console.log(`\nTotal: ${results.length} satributes saved`);
  
  // Count distribution
  const counts = {};
  results.forEach(r => {
    counts[r.satribute] = (counts[r.satribute] || 0) + 1;
  });
  console.log('Distribution:', counts);
}

main();
