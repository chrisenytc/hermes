const {Command, flags} = require('@oclif/command')

const Controller = require('./controller')
const FileManager = require('./file-manager')

class HermesCliCommand extends Command {
  async run() {
    const ctl = new Controller(this.log)

    this.log(FileManager.readBanner())

    try {
      await ctl.exportTravelAgencies()
    } catch (error) {
      this.log(error)
    }
  }
}

HermesCliCommand.description = `A CLI tool to search travel agencies in Brazil

Use this tool to export a list of travel agencies in json format
`

HermesCliCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
}

module.exports = HermesCliCommand
