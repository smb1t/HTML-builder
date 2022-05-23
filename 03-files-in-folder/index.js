const { stat } = require('fs');
const {readdir} = require('fs/promises');
const path = require('path');

(function getFileInfo() {
  const taskPath = `${__dirname}/secret-folder`;
  readdir(taskPath, {withFileTypes: true})
    .then(files => {
      // console.log('\n');
      for (let file of files) {
        stat(path.join(taskPath,file.name), (err, stats) => {
          if ( file.isFile() ) {
            const name = file.name.split('.').slice(0, -1).join('.');
            const ext = path.extname(file.name).split('.').pop();
            const size = Math.round(stats.size / 1024 * 1000) / 1000 + 'Kb';
            console.log(`${name} - ${ext} - ${size}`);
          }
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
})();