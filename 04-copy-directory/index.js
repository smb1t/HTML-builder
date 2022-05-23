const {mkdir, copyFile, readdir, rm } = require('fs/promises');
const path = require('path');
const defaultPath = path.join(__dirname, 'files');
const taskPath = {
  src: defaultPath,
  dest: `${defaultPath}-copy`,
};

(async function copyFiles() {
  await rm(taskPath.dest, { recursive:true, force:true });
  await mkdir(taskPath.dest, { recursive: true }, err => {
    if (err) throw err;
  });
  await readdir(taskPath.src, {withFileTypes: true})
    .then(files => {
      for (let file of files) {
        const src = path.join(taskPath.src, file.name);
        const dest = path.join(taskPath.dest, file.name);
        copyFile(src, dest);
      }
    })
    .catch(err => {
      if (err) throw err;
    });
})();
