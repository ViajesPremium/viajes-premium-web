const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/apps1/Documents/viajes-premium-2/frontend/src/features/landings/data';
const folders = ['barrancas', 'europa', 'japon', 'corea'];

folders.forEach(folder => {
  const folderPath = path.join(dir, folder);
  if (!fs.existsSync(folderPath)) return;
  fs.readdirSync(folderPath).forEach(file => {
    if (!file.endsWith('.ts')) return;
    const filePath = path.join(folderPath, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Let's search for all non-ASCII characters to see what is in the files
    const regex = /[^\x00-\x7F]/g;
    let match;
    const matches = [];
    while ((match = regex.exec(content)) !== null) {
      matches.push({ char: match[0], index: match.index });
    }
    if (matches.length > 0) {
      console.log(`File: ${filePath}`);
      matches.forEach(m => {
        const start = Math.max(0, m.index - 20);
        const end = Math.min(content.length, m.index + 20);
        console.log(`  Found '${m.char}' at index ${m.index}: "...${content.substring(start, end).replace(/\n/g, ' ')}..."`);
      });
    }
  });
});
