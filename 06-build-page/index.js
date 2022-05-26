const fs = require('fs');
const path = require('path');
const {pipeline, Transform } = require('stream');
const taskPath = {
  assets: path.join(__dirname, 'assets'),
  components: path.join(__dirname, 'components'),
  styles: path.join(__dirname, 'styles'),
  dest: path.join(__dirname, 'project-dist'),
};

(function builder() {
  fs.rm(taskPath.dest, { recursive:true, force:true }, (err) => {
    if (err) throw err;

    fs.mkdir(taskPath.dest, { recursive: true }, (err) => {
      if (err) throw err;
     
      fs.readFile(path.join(__dirname, 'template.html'), 'utf8', (err, data) => {
        if (err) throw err;

        let template = data;

        let tags = template.match(/{{\s*([\w-]+)\s*}}/g);
        
        for (const tag of tags) {
          const name = tag.replace(/[{}\s]/g, '');
          const target = path.join(taskPath.components, `${name}.html`);

          fs.readFile(target, 'utf8', (err,data) => {
            if (err) throw err;
            let writer = fs.createWriteStream(path.join(taskPath.dest, 'index.html'));
            template = template.replace(tag, data);
            writer.write(template.replace(tag, data));
          });
        }
        copyAssets(taskPath.assets, path.join(taskPath.dest, 'assets'));  
      });
    });
  });
})();

function mergeFiles() {
  const ts = new Transform({
    transform(chunk, enc, cb) {
      this.push(`${chunk}\n`);
      cb();
    }
  });

  fs.readdir(taskPath.styles, {withFileTypes: true}, (err,files) => {
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
  });
}

function copyAssets(srcPath, destPath) {
  fs.mkdir(destPath, { recursive: true }, (err) => {
    if (err) throw err;

    fs.readdir(srcPath, {withFileTypes: true}, (err,files) => {
      for (let file of files) {
        const src = path.join(srcPath, file.name);
        const dest = path.join(destPath, file.name);
        if ( file.isFile() ) {
          fs.copyFile( src, dest, err => {
            if (err) throw err;
          });
        } else {
          copyAssets(src, dest);
        }
      }

      mergeFiles();
    });
  });
}