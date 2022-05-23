const fs = require('fs');
const {readdir} = require('fs/promises');
const {pipeline, Transform } = require('stream');
const path = require('path');
const taskPath = {
  src: path.join(__dirname, 'styles'),
  dest: path.join(__dirname, 'project-dist'),
};

(async function mergeFiles() {
  const ts = new Transform({
    transform(chunk, enc, cb) {
      this.push(`${chunk}\n`);
      cb();
    }
  });
  await readdir(taskPath.src, {withFileTypes: true})
    .then(files => {
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
    })
    .catch(err => {
      if (err) throw err;
    });
    
})();


