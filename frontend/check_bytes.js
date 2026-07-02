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
    const buffer = fs.readFileSync(filePath);
    
    // Check if the buffer is valid UTF-8
    // A simple way is to decode it as UTF-8 and see if it contains \uFFFD (replacement character)
    const utf8Str = buffer.toString('utf8');
    if (utf8Str.includes('\uFFFD')) {
      console.log(`File has invalid UTF-8 (contains \\uFFFD): ${filePath}`);
      // Let's find where the \uFFFD is and print the context
      let index = 0;
      while ((index = utf8Str.indexOf('\uFFFD', index)) !== -1) {
        const start = Math.max(0, index - 30);
        const end = Math.min(utf8Str.length, index + 30);
        console.log(`  At index ${index}: "...${utf8Str.substring(start, end).replace(/\n/g, ' ')}..."`);
        index++;
      }
    }
  });
});
