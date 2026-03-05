#!/usr/bin/env python3
"""
Build mutant badges mapping JSON for frontend.
Uses inscription ID to match with metadata and get collection numbers.
"""

import json
import re
import os
from collections import Counter

def normalize_slug(name):
    """Convert badge name to slug: lowercase, alnum + underscores"""
    if not name:
        return None
    slug = name.lower().strip()
    slug = re.sub(r'[\s\-]+', '_', slug)
    slug = re.sub(r'[^a-z0-9_]', '', slug)
    slug = re.sub(r'_+', '_', slug)
    slug = slug.strip('_')
    return slug

def extract_collection_number(name, inscription_id, metadata_by_id):
    """Extract collection number from metadata using inscription ID"""
    # Try to get from metadata first
    if inscription_id in metadata_by_id:
        meta_name = metadata_by_id[inscription_id].get('meta', {}).get('name', '')
        # Extract number from name like "ORDIMUTANT #1234" or "ORDIMUTANT OG#0"
        match = re.search(r'#(\d+)', meta_name)
        if match:
            return match.group(1)
    return None

def main():
    repo_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(repo_dir, 'data')
    
    # Load all data
    print("Loading data files...")
    
    with open(os.path.join(data_dir, 'satributes.json'), 'r') as f:
        satributes = json.load(f)
    
    with open(os.path.join(data_dir, 'metadata.json'), 'r') as f:
        metadata = json.load(f)
    
    # Build metadata lookup by inscription ID
    metadata_by_id = {m['id']: m for m in metadata}
    
    print(f"Loaded {len(satributes)} satributes, {len(metadata)} metadata entries")
    
    # Also load CSV to get collection number -> inscription ID mapping
    csv_map = {}  # collection_number -> inscription_id
    with open(os.path.join(data_dir, 'mutants.csv'), 'r') as f:
        lines = f.readlines()[1:]  # skip header
        for line in lines:
            parts = line.strip().split(',')
            if len(parts) >= 4:
                inscription_id = parts[1]
                number = parts[3]
                if number:
                    try:
                        num = int(float(number))
                        csv_map[num] = inscription_id
                    except:
                        pass
    
    print(f"Loaded {len(csv_map)} CSV entries")
    
    # Build reverse map: inscription_id -> collection_number
    id_to_collection = {v: str(k) for k, v in csv_map.items()}
    
    # Also handle special names (DIAMONDHANDED JEETER, etc.)
    for m in metadata:
        name = m.get('meta', {}).get('name', '')
        if 'DIAMOND' in name or 'BLK' in name:
            # Extract from inscription ID
            pass
    
    # Build mapping: collection_number -> [badgeSlugs]
    mapping = {}
    slug_counts = Counter()
    
    for entry in satributes:
        inscription_id = entry.get('id', '')
        satribute = entry.get('satribute', '')
        
        if not inscription_id or not satribute:
            continue
        
        # Get collection number from ID mapping
        collection_num = id_to_collection.get(inscription_id)
        
        if not collection_num:
            # Try from metadata name
            collection_num = extract_collection_number(None, inscription_id, metadata_by_id)
        
        if not collection_num:
            continue
        
        slug = normalize_slug(satribute)
        if not slug:
            continue
        
        if collection_num not in mapping:
            mapping[collection_num] = []
        
        if slug not in mapping[collection_num]:
            mapping[collection_num].append(slug)
            slug_counts[slug] += 1
    
    # Sort badges per token by rarity
    RARITY_ORDER = [
        'block_9_450x', 'alpha', 'omega', 'paliblock_palindrome', 'palindrome',
        'block_666', 'block_286', 'block_78', 'block_9', 'first_transaction',
        'nakamoto', 'pizza', 'hitman', 'silk_road', 'jpeg', 'vintage',
        'black_uncommon', 'uncommon', 'common'
    ]
    
    def sort_badges(badges):
        return sorted(badges, key=lambda x: RARITY_ORDER.index(x) if x in RARITY_ORDER else 999)
    
    for token_id in mapping:
        mapping[token_id] = sort_badges(mapping[token_id])
    
    # Write output
    output_file = os.path.join(data_dir, 'mutant_badges.json')
    print(f"\nWriting {len(mapping)} tokens to: {output_file}")
    with open(output_file, 'w') as f:
        json.dump(mapping, f, indent=2)
    
    # Summary
    tokens_with_badges = sum(1 for b in mapping.values() if b)
    print(f"\n=== Summary ===")
    print(f"Total tokens in mapping: {len(mapping)}")
    print(f"Tokens with >=1 badge: {tokens_with_badges}")
    print(f"\nTop 10 most common badges:")
    for slug, count in slug_counts.most_common(10):
        print(f"  {slug}: {count}")
    
    # Sample entries
    print(f"\n=== Sample Entries ===")
    sample_ids = list(mapping.keys())[:5]
    for tid in sample_ids:
        print(f"  {tid}: {mapping[tid]}")

if __name__ == '__main__':
    main()
