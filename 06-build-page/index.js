const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

class HTMLBuilder {
  constructor() {
    this.htmlTpl = 'template.html';
    this.html = 'index.html';
    this.css = 'style.css';
    this.path = {
      assets: path.join(__dirname, 'assets'),
      components: path.join(__dirname, 'components'),
      styles: path.join(__dirname, 'styles'),
      dest: path.join(__dirname, 'project-dist'),
    };
    this.path.assetsDest = path.join(this.path.dest, 'assets');
  }

  async build() {
    await this.createDist(this.path.dest);

    this.copyAssets(this.path.assets, this.path.assetsDest);
    this.mergeStyles();
    this.buildHtml();

    this.printMessage('\nProject building complete!');
  }

  getSortedFiles(arr, fileName) {
    const i = arr.findIndex(el => el.name.indexOf(fileName) >= 0);
    const curr = arr[i];
    arr.splice(i, 1);
    arr.unshift(curr);
    return fileName !== 'header' ? this.getSortedFiles(arr, 'header') : arr;
  }

  async printMessage(mes, color) {
    const c = color ? color : '\x1b[33m%s\x1b[0m';
    console.log(c, mes, '\n');
  }

  async createDist(dest) {
    await fsp.access(dest)
      .then(async () => {
        await fsp.rm(dest, { recursive: true, force: true });
        await fsp.mkdir(dest, { recursive: true });
      })
      .catch(() => {
        fsp.mkdir(dest, { recursive: true });
      });
  }

  async buildHtml() {
    const components = await fsp.readdir(this.path.components, { withFileTypes: true });
    const htmlData = new Object();

    for (const file of components) {
      if (file.isFile() && path.extname(path.join(this.path.components, file.name)) === '.html') {
        htmlData[file.name.split('.')[0]] = await fsp.readFile(path.join(this.path.components, file.name), 'utf-8');
      }
    }

    await fsp.readFile(path.join(__dirname, this.htmlTpl), 'utf8')
      .then((template) => {
        let output = template;
        const tags = template.match(/{{\s*([\w-]+)\s*}}/g);

        for (const tag of tags) {
          const name = tag.replace(/[{}\s]/g, '');
          output = output.replace(tag, htmlData[name]);
        }

        const writer = fs.createWriteStream(path.join(this.path.dest, this.html));
        writer.write(output);
      })
      .catch(err => {
        if (err) throw err;
      });
  }

  async copyAssets(src, dest) {
    try {
      await fsp.access(dest);
      fsp.readdir(src, { withFileTypes: true })
        .then(async files => {
          for (const file of files) {
            const srcFile = path.join(src, file.name);
            const destFile = path.join(dest, file.name);

            if (file.isFile()) {
              fsp
                .copyFile(srcFile, destFile, fs.constants.COPYFILE_FICLONE)
                .catch(err => {
                  if (err) throw err;
                });
            } else {
              await fsp
                .mkdir(destFile, { recursive: true })
                .then(this.copyAssets(srcFile, destFile));
            }
          }
        })
        .catch(err => {
          if (err) throw err;
        });
    } catch (err) {
      await fsp.mkdir(dest, { recursive: true });
      this.copyAssets(src, dest);
    }
  }

  async mergeStyles() {
    const ws = fs.createWriteStream(path.join(this.path.dest, this.css), 'utf-8');

    await fsp.readdir(this.path.styles, { withFileTypes: true })
      .then(data => {
        const files = this.getSortedFiles(data, 'footer');

        for (const file of files) {
          if (file.isFile() && path.extname(file.name) === '.css') {
            fs
              .createReadStream(path.join(this.path.styles, file.name), 'utf-8')
              .on('data', chunk => {
                ws.write(chunk);
              });
          }
        }
      })
      .catch(err => {
        if (err) throw err;
      });
  }
}

const app = new HTMLBuilder();
app.build();