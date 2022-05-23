const fs = require('fs');
const {mkdir, copyFile, readdir, rm, readFile } = require('fs/promises');
const path = require('path');
const {pipeline, Transform } = require('stream');
const taskPath = {
  assets: path.join(__dirname, 'assets'),
  components: path.join(__dirname, 'components'),
  styles: path.join(__dirname, 'styles'),
  dest: path.join(__dirname, 'project-dist'),
};

(async function builder() {
  await rm(taskPath.dest, { recursive:true, force:true });

  await mkdir(taskPath.dest, { recursive: true }, (err) => {
    if (err) throw err;
  });
  let template = await readFile(path.join(__dirname, 'template.html'), 'utf8', err => {
    if (err) throw err;
  });
  let tags = template.match(/{{\s*([\w-]+)\s*}}/g);
  let writer = fs.createWriteStream(path.join(taskPath.dest, 'index.html'));

  for (const tag of tags) {
    const name = tag.replace(/[{}\s]/g, '');
    const target = path.join(taskPath.components, `${name}.html`);
    const part = await readFile(target, 'utf8', err => {
      if (err) throw err;
    });
    template = template.replace(tag, part);
  }
  writer.write(template);
  
  await copyAssets(taskPath.assets, path.join(taskPath.dest, 'assets'));
  await mergeFiles();
})();

async function mergeFiles() {
  const ts = new Transform({
    transform(chunk, enc, cb) {
      this.push(`${chunk}\n`);
      cb();
    }
  });

  await readdir(taskPath.styles, {withFileTypes: true})
    .then(files => {
      files.push(files.splice(0, 1)[0]);
      for (let file of files) {
        // console.log(file);
        if ( file.isFile() && path.extname(file.name) === '.css' ) {
          pipeline(
            fs.createReadStream(path.join(taskPath.styles, file.name)),
            ts,
            fs.createWriteStream(path.join(taskPath.dest, 'style.css')),
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
}

async function copyAssets(srcPath, destPath) {
  await mkdir(destPath, { recursive: true }, (err) => {
    if (err) throw err;
  });
  await readdir(srcPath, {withFileTypes: true})
    .then(files => {
      for (let file of files) {
        const src = path.join(srcPath, file.name);
        const dest = path.join(destPath, file.name);
        if ( file.isFile() ) {
          copyFile( src, dest);
        } else {
          copyAssets(src, dest);
        }
      }
    })
    .catch(err => {
      if (err) throw err;
    });
}

