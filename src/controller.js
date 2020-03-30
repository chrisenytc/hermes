const logUpdate = require('log-update')

const Inquirer = require('./inquirer')
const DataSource = require('./datasource')
const FileManager = require('./file-manager')

class Controller {
  constructor(logger) {
    this.inquirer = new Inquirer()
    this.datasource = new DataSource()
    this.fileManager = new FileManager()
    this.log = logger
  }

  startLoader(message) {
    const frames = ['-', '\\', '|', '/']
    let i = 0

    this.log()

    let timer = setInterval(function () {
      const frame = frames[i = ++i % frames.length]
      logUpdate(
        `${frame} ${message} ${frame}`
      )
    }, 100)

    return timer
  }

  stopLoader(timer) {
    clearInterval(timer)
    logUpdate.done()
  }

  async exportTravelAgencies() {
    const name = await this.inquirer.askName()
    const state = await this.inquirer.askState()
    const city = await this.inquirer.askCity(state)

    let neighborhood = ''

    if (city !== '') {
      neighborhood = await this.inquirer.askNeighborhood(state, city)
    }

    let timer = this.startLoader('Downloading data...')

    const results = await this.datasource.getTravelAgencies(name, state, city, neighborhood)

    this.stopLoader(timer)

    this.log()
    this.log('  Writing data to file...')

    this.fileManager.writeFile(results)

    this.log('  Completed!')
  }
}

module.exports = Controller
