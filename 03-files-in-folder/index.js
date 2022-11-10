const { readdir, stat } = require('fs/promises');
const path = require('path');
const color = '\x1b[33m%s\x1b[0m';

(() => {
  const p = `${__dirname}/secret-folder`;

  readdir(p, { withFileTypes: true })
    .then(async files => {
      for (const [index, file] of files.entries()) {
        const stats = await stat(path.join(p, file.name));

        if (index === 0) console.log(color, '\nList of files in the "secret folder" directory:\n');

        if (file.isFile()) {
          const name = file.name.split('.').slice(0, -1).join('.');
          const ext = path.extname(file.name).split('.').pop();
          const unit = stats.size < 1000 ? 'Byte' : 'Kb';
          let size = 0;

          if (stats.size !== 0) {
            const i = parseInt(Math.floor(Math.log(stats.size) / Math.log(1024)), 10);

            if (i === 0) {
              size = stats.size;
            } else {
              size = stats.size / (1024 ** i);
            }
          }

          console.log(`${name} - ${ext} - ${size}${unit}`);
        }
      }
    })
    .catch(err => {
      if (err) throw err;
    }).finally(() => {
      console.log(color, '\nThat\'s all!\n');
    });
})();