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
      // eslint-disable-next-line no-undef
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
      // eslint-disable-next-line no-undef
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
      // eslint-disable-next-line no-undef
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
    const browser = await puppeteer.launch()
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

    let list = []

    const selector = 'div.blog-section > div.blog-post > div.post-box > div.post-content:first-child'

    async function getList(selector) {
      const results = await page.evaluate(selector => {
        // eslint-disable-next-line no-undef
        return [...document.querySelectorAll(selector)].map(function (element) {
          const elementChildren = element.children

          let el = {}

          if (typeof elementChildren[1] !== 'undefined') {
            el.name = elementChildren[1].textContent
          }
          if (typeof elementChildren[2] !== 'undefined') {
            el.address = elementChildren[2].textContent
          }
          if (typeof elementChildren[3] !== 'undefined') {
            el.phoneNumber = elementChildren[3].textContent
          }
          if (typeof elementChildren[4] !== 'undefined') {
            if (elementChildren[4].textContent.startsWith('Site')) {
              el.site = elementChildren[4].textContent
            }
            if (elementChildren[4].textContent.startsWith('E-mail')) {
              el.email = elementChildren[4].textContent
            }
          }
          if (typeof elementChildren[5] !== 'undefined') {
            el.email = elementChildren[5].textContent
          }

          return el
        })
      }, selector)

      return results
    }

    async function recursiveSearch() {
      const paginationSelector = 'span#ctl00_ContentPlaceHolder_Content_dtpListagem_Resultados > a.Numeric_Links'

      const paginationLinks = await page.evaluate(selector => {
        // eslint-disable-next-line no-undef
        return [...document.querySelectorAll(selector)].map(function (element) {
          return {
            pageNumber: element.textContent,
          }
        })
      }, paginationSelector)

      for (let index = 0; index < paginationLinks.length; ++index) {
        let element = paginationLinks[index]

        if (index === 0 && element.pageNumber === '...') {
          continue
        }

        // eslint-disable-next-line no-await-in-loop
        await Promise.all([
          page.waitForNavigation(),
          page.click(`${paginationSelector}:nth-of-type(${index + 1})`),
        ])

        // eslint-disable-next-line no-await-in-loop
        const result = await getList(selector)
        // eslint-disable-next-line require-atomic-updates
        list = list.concat(result)

        if (element.pageNumber === '...') {
          // eslint-disable-next-line no-await-in-loop
          await recursiveSearch()
        }
      }
    }

    // eslint-disable-next-line require-atomic-updates
    list = list.concat(await getList(selector))

    await recursiveSearch()

    await browser.close()

    return list
  }
}

module.exports = DataSource
