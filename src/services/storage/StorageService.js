const fs = require('node:fs');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(this._folder)) {
      fs.mkdirSync(folder, {
        recursive: true,
      });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const writeableStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      writeableStream.on('error', (error) => reject(error));
      file.pipe(writeableStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;
