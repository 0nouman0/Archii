const fs = require('fs');
const path = 'lib/rag/retriever.js';
let f = fs.readFileSync(path, 'utf8');
console.log('Current file size:', f.length, 'bytes');
// Count exports
const exports_ = (f.match(/^export (async )?function/gm) || []);
console.log('Exports found:', exports_.join(', '));
const funcs = (f.match(/^(export )?(async )?function \w+/gm) || []);
console.log('Functions:', funcs.join(' | '));
