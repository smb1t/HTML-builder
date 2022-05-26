const {mkdir, copyFile, readdir, rm } = require('fs');
const path = require('path');
const defaultPath = path.join(__dirname, 'files');
const taskPath = {
  src: defaultPath,
  dest: `${defaultPath}-copy`,
};

(function copyFiles() {
  rm(taskPath.dest, { recursive:true, force:true },err => {
    if (err) throw err;

    mkdir(taskPath.dest, { recursive: true }, (err) => {
      if (err) throw err;

      readdir(taskPath.src, {withFileTypes: true}, (err, files) => {
        for (let file of files) {
          const src = path.join(taskPath.src, file.name);
          const dest = path.join(taskPath.dest, file.name);
          copyFile(src, dest, (err) => {
            if (err) throw err;
          });
        }
      });

    });
  });
})();
