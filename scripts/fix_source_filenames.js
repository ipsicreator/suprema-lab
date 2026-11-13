const fs = require('fs');
const path = require('path');

const sourceDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\outputs\\unified_sources';

const files = fs.readdirSync(sourceDir);

files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    if (fs.lstatSync(filePath).isDirectory()) return;

    const content = fs.readFileSync(filePath, 'utf-8');
    const firstLine = content.split('\n')[0];
    
    // Extract university name from "# [Univ Name]대학교 2028..."
    const match = firstLine.match(/#\s*([가-힣]+대학교)/);
    if (match) {
        const univName = match[1];
        const newFileName = `${univName}_Source.md`;
        const newPath = path.join(sourceDir, newFileName);
        
        if (filePath !== newPath) {
            console.log(`Renaming: ${file} -> ${newFileName}`);
            // If newPath already exists, we might need to merge or distinguish, but for now, let's just rename.
            if (!fs.existsSync(newPath)) {
                fs.renameSync(filePath, newPath);
            } else {
                console.log(`Skip: ${newFileName} already exists.`);
            }
        }
    } else {
        // Fallback for cases like "배재??교"
        const cleanMatch = firstLine.match(/#\s*([가-힣\?]+?대학교)/);
        if (cleanMatch) {
            const univName = cleanMatch[1].replace(/\?/g, '');
            const newFileName = `${univName}_Source.md`;
            const newPath = path.join(sourceDir, newFileName);
            if (!fs.existsSync(newPath)) {
                fs.renameSync(filePath, newPath);
            }
        }
    }
});
