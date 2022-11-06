const { createReadStream, createWriteStream } = require('fs');
const { readdir, rm } = require('fs/promises');

const path = require('path');
const p = {
  src: path.join(__dirname, 'styles'),
  dest: path.join(__dirname, 'project-dist'),
};
const bundle = 'bundle.css';
const target = path.join(p.dest, bundle);
const ws = createWriteStream(target, 'utf-8');

(async () => {
  await readdir(p.dest, { withFileTypes: true })
    .then(files => {
      if (files.indexOf(bundle) >= 0) {
        rm(target, { force: true });
      }
    });

  await readdir(p.src, { withFileTypes: true })
    .then(files => {
      for (const file of files) {
        if (file.isFile() && path.extname(file.name) === '.css') {
          createReadStream(path.join(p.src, file.name), 'utf-8')
            .on('data', chunk => {
              ws.write(chunk);
            });
        }
      }
    })
    .finally(() => {
      console.log(
        '\x1b[33m%s\x1b[0m',
        `\nFile ${bundle} created successfully!\n`
      );
    });
})();
