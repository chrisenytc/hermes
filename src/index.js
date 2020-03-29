const {Command, flags} = require('@oclif/command')

class HermesCliCommand extends Command {
  async run() {
    this.log('hello from ./src/index.js')
  }
}

HermesCliCommand.description = `A cli tool to search travel agencies

Use this tool to export a list of travel agencies in json format
`

HermesCliCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
}

module.exports = HermesCliCommand
