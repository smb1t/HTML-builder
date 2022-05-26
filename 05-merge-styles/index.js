const fs = require('fs');
const {pipeline, Transform } = require('stream');
const path = require('path');
const taskPath = {
  src: path.join(__dirname, 'styles'),
  dest: path.join(__dirname, 'project-dist'),
};

(function mergeFiles() {
  const ts = new Transform({
    transform(chunk, enc, cb) {
      this.push(`${chunk}\n`);
      cb();
    }
  });
  fs.readdir(taskPath.src, {withFileTypes: true}, (err, files) => {
    for (let file of files) {
      if ( file.isFile() && path.extname(file.name) === '.css' ) {
        pipeline(
          fs.createReadStream(path.join(taskPath.src, file.name)),
          ts,
          fs.createWriteStream(path.join(taskPath.dest, 'bundle.css')),
          (err) => {
            if (err) throw err;
          }
        );
      }
    }      
  });
})();


