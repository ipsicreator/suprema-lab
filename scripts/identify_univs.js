const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfDir = 'C:\\Users\\chris\\Desktop\\수프리마랩\\.tmp\\adiga_seoul_priority1_unzipped';

async function identify() {
    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    const mapping = [];

    for (const file of files) {
        try {
            const dataBuffer = fs.readFileSync(path.join(pdfDir, file));
            const data = await pdf(dataBuffer, { max: 1 }); // Just page 1
            const text = data.text;
            
            // Look for university name
            const match = text.match(/([가-힣]+대학교)/) || text.match(/([가-힣]+대\s)/);
            const univName = match ? match[1].trim() : "Unknown";
            
            mapping.push({ file, univName });
            console.log(`${file} -> ${univName}`);
        } catch (e) {
            console.error(`Error ${file}: ${e.message}`);
        }
    }
    fs.writeFileSync('univ_mapping.json', JSON.stringify(mapping, null, 2));
}

identify();
