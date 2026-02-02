const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
const icons = {};
let count = 0;

function extractPath(svg) {
  const matches = svg.match(/d="([^"]+)"/g);
  if (!matches) return null;
  return matches.map(m => m.match(/d="([^"]+)"/)[1]).join(' ');
}

function scanDir(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (item.endsWith('.svg')) {
      try {
        const svg = fs.readFileSync(fullPath, 'utf8');
        const pathData = extractPath(svg);
        if (pathData) {
          const rel = path.relative(iconsDir, fullPath);
          const key = rel.replace(/\\/g, '/').replace('.svg', '').replace(/\//g, '-');
          icons[key] = pathData;
          count++;
          if (count % 500 === 0) console.log(`Processed ${count} icons...`);
        }
      } catch (e) {
        // Skip errors
      }
    }
  });
}

console.log('Scanning icons...');
scanDir(iconsDir);
console.log(`Found ${count} icons`);

// Generate simplified list for UI
const categories = {};
Object.keys(icons).forEach(key => {
  const parts = key.split('-');
  const cat = parts[0] || 'Others';
  if (!categories[cat]) categories[cat] = [];
  const name = parts.slice(1).join('-').replace(/-line$/, '').replace(/-fill$/, '');
  const label = name.split('-').map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ');
  categories[cat].push({ value: key, label: label || name });
});

// Write to file
const output = {
  icons: icons,
  categories: categories,
  count: count
};

fs.writeFileSync(path.join(__dirname, 'icon-data.json'), JSON.stringify(output, null, 2));
console.log(`Saved to icon-data.json`);

// Also create TypeScript constant
const tsContent = `// Auto-generated from RemixIcon SVG files
// Total: ${count} icons

export const REMIX_ICONS: Record<string, string> = ${JSON.stringify(icons, null, 2).substring(0, 50000)}... (truncated, see icon-data.json for full list)
`;

console.log('Done!');
