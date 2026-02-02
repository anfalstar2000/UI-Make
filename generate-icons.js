const fs = require('fs');
const path = require('path');

// Read all SVG files and extract paths
const iconsDir = path.join(__dirname, 'icons');
const icons = {};

function extractPathFromSVG(svgContent) {
  // Extract all path data from SVG (handle multiple paths)
  const pathsMatch = svgContent.match(/<path[^>]*d="([^"]+)"[^>]*>/g);
  if (pathsMatch && pathsMatch.length > 0) {
    // Combine all paths
    return pathsMatch.map(p => {
      const match = p.match(/d="([^"]+)"/);
      return match ? match[1] : '';
    }).filter(p => p).join(' ');
  }
  
  // Try single path
  const pathMatch = svgContent.match(/<path[^>]*d="([^"]+)"[^>]*>/);
  if (pathMatch) {
    return pathMatch[1];
  }
  
  return null;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.svg')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Get all SVG files
const svgFiles = walkDir(iconsDir);

console.log(`Found ${svgFiles.length} SVG files`);

svgFiles.forEach(filePath => {
  const svgContent = fs.readFileSync(filePath, 'utf8');
  const pathData = extractPathFromSVG(svgContent);
  
  if (pathData) {
    // Convert file path to icon name
    // icons/Arrows/arrow-right-line.svg -> arrow-right-line
    const relativePath = path.relative(iconsDir, filePath);
    const iconName = relativePath.replace(/\\/g, '/').replace('.svg', '');
    const key = iconName.replace(/\//g, '-');
    
    icons[key] = pathData;
  }
});

// Generate TypeScript file
const tsContent = `// Auto-generated icon paths from RemixIcon SVG files
// Generated on: ${new Date().toISOString()}
// Total icons: ${Object.keys(icons).length}

export const REMIX_ICON_PATHS: Record<string, string> = ${JSON.stringify(icons, null, 2)};

export const REMIX_ICON_LIST: Array<{ value: string; label: string; category: string }> = [
${Object.keys(icons).map(key => {
  const parts = key.split('-');
  const category = parts[0];
  const name = parts.slice(1).join('-').replace(/-line$/, '').replace(/-fill$/, '');
  const label = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `  { value: "${key}", label: "${label}", category: "${category}" }`;
}).join(',\n')}
];
`;

fs.writeFileSync(path.join(__dirname, 'icon-paths.ts'), tsContent);
console.log(`Generated icon-paths.ts with ${Object.keys(icons).length} icons`);

// Also generate JSON for UI
const jsonContent = JSON.stringify({
  icons: icons,
  list: Object.keys(icons).map(key => {
    const parts = key.split('-');
    const category = parts[0];
    const name = parts.slice(1).join('-').replace(/-line$/, '').replace(/-fill$/, '');
    const label = name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return { value: key, label, category };
  })
}, null, 2);

fs.writeFileSync(path.join(__dirname, 'icon-paths.json'), jsonContent);
console.log(`Generated icon-paths.json`);
