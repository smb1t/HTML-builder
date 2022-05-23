const fs = require('fs');
const ws = fs.createWriteStream('02-write-file/text.txt');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');
const rl = readline.createInterface({ input, output });

rl.question('Write some text, please.\n', (answer) => {
  ws.write(`${answer}\n`);
});

rl.on('line', (input) => {
  if (input === 'exit') {
    rl.emit('SIGINT');
  } else {
    ws.write(`${input}\n`);
  }
});

rl.on('SIGINT', () => {
  output.write('That\'s all!\n');
  rl.close();
});