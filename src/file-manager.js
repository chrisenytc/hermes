const fs = require('fs')
const {join} = require('path')

class FileManager {
  static readBanner() {
    return fs.readFileSync(join(process.cwd(), 'assets', 'banner.txt')).toString()
  }

  writeFile(data) {
    let payload = JSON.stringify(data, null, 2)
    fs.writeFileSync(join(process.cwd(), 'results.json'), payload)
  }
}

module.exports = FileManager
