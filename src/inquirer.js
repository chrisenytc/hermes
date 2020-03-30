const R = require('ramda')
const str = require('string')
const inquirer = require('inquirer')

const DataSource = require('./datasource')

class Inquirer {
  constructor() {
    this.datasource = new DataSource()
  }

  async askName() {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name of the agency (optional)',
        default: '',
      },
    ])

    return answers.name
  }

  async askState() {
    const states = await this.datasource.getStates()

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'state',
        message: 'Select a state (optional)',
        default: '',
        choices: states,
      },
    ])

    return answers.state
  }

  async askCity(state) {
    const cities = await this.datasource.getCities(state)

    const formattedValues = R.prepend({name: '', value: ''}, R.map(c => {
      return {
        name: str(c.name).capitalize().titleCase().s,
        value: c.value,
        short: str(c.name).capitalize().titleCase().s,
      }
    }, cities))

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'city',
        message: 'Select a city (optional)',
        default: '',
        choices: formattedValues,
      },
    ])

    return answers.city
  }

  async askNeighborhood(state, city) {
    const neighborhoods = await this.datasource.getNeighborhoods(state, city)

    const formattedValues = R.map(c => {
      return {
        name: str(c.name).capitalize().titleCase().s,
        value: c.value,
        short: str(c.name).capitalize().titleCase().s,
      }
    }, neighborhoods)

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'neighborhood',
        message: 'Select a neighborhood (optional)',
        default: '',
        choices: formattedValues,
      },
    ])

    return answers.neighborhood
  }
}

module.exports = Inquirer
