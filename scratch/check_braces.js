const fs = require('fs');
const content = fs.readFileSync('d:\\ElanAz\\2el-front\\app\\cabinet\\invoices\\page.tsx', 'utf8');
let openBraces = 0;
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let char of line) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
    }
    if (openBraces < 0) {
        console.log(`Extra closing brace at line ${i + 1}`);
        openBraces = 0;
    }
}
console.log(`Final open braces: ${openBraces}`);
