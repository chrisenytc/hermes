const puppeteer = require('puppeteer')

class DataSource {
  constructor() {
    this.url = 'http://www.abav.com.br/encontre_agente.aspx'
  }

  async getStates() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(this.url)

    const selector = "select[name='ctl00$ContentPlaceHolder_Content$ddlEstado'] option"

    const list = await page.evaluate(selector => {
      return [...document.querySelectorAll(selector)].map(function (element) {
        return {
          name: element.textContent,
          value: element.value,
        }
      })
    }, selector)

    list.shift()

    await browser.close()

    return list
  }

  async getCities(state) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(this.url)

    await page.select("select[name='ctl00$ContentPlaceHolder_Content$ddlEstado']", state)

    const selector = "select[name='ctl00$ContentPlaceHolder_Content$ddlCidade'] option"

    await page.waitFor(5000)

    const list = await page.evaluate(selector => {
      return [...document.querySelectorAll(selector)].map(function (element) {
        return {
          name: element.textContent,
          value: element.value,
        }
      })
    }, selector)

    list.shift()

    await browser.close()

    return list
  }

  async getNeighborhoods(state, city) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(this.url)

    await page.select("select[name='ctl00$ContentPlaceHolder_Content$ddlEstado']", state)

    await page.waitFor(5000)

    await page.select("select[name='ctl00$ContentPlaceHolder_Content$ddlCidade']", city)

    const selector = "select[name='ctl00$ContentPlaceHolder_Content$ddlBairro'] option"

    await page.waitFor(5000)

    const list = await page.evaluate(selector => {
      return [...document.querySelectorAll(selector)].map(function (element) {
        return {
          name: element.textContent,
          value: element.value,
        }
      })
    }, selector)

    list.shift()

    await browser.close()

    return list
  }

  async getTravelAgencies(name, state, city, neighborhood) {
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()
    await page.goto(this.url)

    await page.type("input[name='ctl00$ContentPlaceHolder_Content$txtNome']", name)

    await page.select("select[name='ctl00$ContentPlaceHolder_Content$ddlEstado']", state)

    await page.waitFor(5000)

    await page.select("select[name='ctl00$ContentPlaceHolder_Content$ddlCidade']", city)

    await page.waitFor(5000)

    await page.select("select[name='ctl00$ContentPlaceHolder_Content$ddlBairro']", neighborhood)

    await page.waitFor(5000)

    await Promise.all([
      page.waitForNavigation(),
      page.click('a#ctl00_ContentPlaceHolder_Content_btnEnviar'),
    ])

    const selector = 'div.blog-section > div.blog-post > div.post-box > div.post-content:first-child'

    const list = await page.evaluate(selector => {
      return [...document.querySelectorAll(selector)].map(function (element) {
        return {
          name: element.children[1].textContent,
          address: element.children[2].textContent,
          phoneNumber: element.children[3].textContent,
          site: (element.children[4].textContent || '').replace('Site: ', ''),
          email: (element.children[5].textContent || '').replace('E-mail: ', ''),
        }
      })
    }, selector)

    await browser.close()

    return list
  }
}

const ds = new DataSource();

(async () => {
  const states = await ds.getTravelAgencies('BLUE GATE TURISMO', 'SP', 'SÃO PAULO', 'Vila Olímpia')
  console.log(states)
})()

module.exports = DataSource
