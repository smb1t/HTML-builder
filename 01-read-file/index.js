const { createReadStream } = require('fs');
const stream = createReadStream('01-read-file/text.txt', 'utf-8');
let data = '';

stream.on('data', chunk => data += chunk);
stream.on('end', () => console.log('\n', data));
stream.on('error', err => {
  if (err) throw err;
});