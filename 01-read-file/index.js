const fs = require('fs');
const stream = fs.createReadStream('01-read-file/text.txt', 'utf-8');
let data = '';

stream.on('data', chunk => data += chunk);
stream.on('end', () => console.log(data));
stream.on('error', err => {
  if (err) throw err;
});