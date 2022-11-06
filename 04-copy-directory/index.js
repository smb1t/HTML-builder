const { mkdir, copyFile, readdir, rm } = require('fs/promises');
const path = require('path');
const defaultPath = path.join(__dirname, 'files');
const p = {
  src: defaultPath,
  dest: `${defaultPath}-copy`,
};

(async () => {
  await rm(p.dest, { recursive: true, force: true });
  await mkdir(p.dest, { recursive: true });

  const files = await readdir(p.src, { withFileTypes: true });

  for (const file of files) {
    copyFile(
      path.join(p.src, file.name),
      path.join(p.dest, file.name)
    );
  }

  console.log('\x1b[33m%s\x1b[0m', '\nFiles copied!\n');
})();