const { Select } = require('enquirer')
const FtechFormat = require('./fetch-format.js')
const AREA_URL = 'https://muro.sakenowa.com/sakenowa-data/api/areas'
const BREWERIES_URL = 'https://muro.sakenowa.com/sakenowa-data/api/breweries'
const BRANDS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/brands'
const FLAVOR_URL = 'https://muro.sakenowa.com/sakenowa-data/api/flavor-charts'
const RANKINGS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/rankings'

class ChoiceFormat {
  async choiceSelect (choicesList, topChoiceMassage) {
    return new Promise(resolve => {
      const prompt = new Select({
        message: topChoiceMassage,
        limit: 15,
        choices: choicesList,
        result () {
          return this.focused.value
        }
      })
      prompt.run()
        .then(answer => { resolve(answer) })
    })
  }

  async choiceSelectFooter (choicesList, flavorList, topChoiceMassage) {
    return new Promise(resolve => {
      const prompt = new Select({
        message: topChoiceMassage,
        footer () {
          const targetFlavor = flavorList.flavorCharts.filter(({ brandId }) => brandId === this.focused.value)
          // チャート値は0.nnnnnになるため視覚的に見にくいため
          // 視覚的に見やすいよう*10をして、10点中n点表記に変更
          const f1 = targetFlavor[0] === undefined ? 'undefined' : (Math.round(targetFlavor[0].f1 * 100) / 10).toFixed(1)
          const f2 = targetFlavor[0] === undefined ? 'undefined' : (Math.round(targetFlavor[0].f2 * 100) / 10).toFixed(1)
          const f3 = targetFlavor[0] === undefined ? 'undefined' : (Math.round(targetFlavor[0].f3 * 100) / 10).toFixed(1)
          const f4 = targetFlavor[0] === undefined ? 'undefined' : (Math.round(targetFlavor[0].f4 * 100) / 10).toFixed(1)
          const f5 = targetFlavor[0] === undefined ? 'undefined' : (Math.round(targetFlavor[0].f5 * 100) / 10).toFixed(1)
          const f6 = targetFlavor[0] === undefined ? 'undefined' : (Math.round(targetFlavor[0].f6 * 100) / 10).toFixed(1)
          return '==================================================\n' +
            '◆　フレーバーチャート ※10が上限\n' +
            '==================================================\n' +
            `華やか  ： ${f1}\n` +
            `芳醇    ： ${f2}\n` +
            `重厚    ： ${f3}\n` +
            `穏やか  ： ${f4}\n` +
            `ドライ  ： ${f5}\n` +
            `軽快    ： ${f6}\n` +
            '==================================================\n'
        },
        limit: 15,
        choices: choicesList,
        result () {
          return this.focused.value
        }
      })
      prompt.run()
        .then(answer => { resolve(answer) })
    })
  }

  async searchForSakeFromArea () {
    const ftechFormat = new FtechFormat()
    /// さけのわAPIから各種データを取得
    const areasJsonData = await ftechFormat.fetchSakenowaApi(AREA_URL)
    const flavorJsonData = await ftechFormat.fetchSakenowaApi(FLAVOR_URL)
    const breweriesJsonData = await ftechFormat.fetchSakenowaApi(BREWERIES_URL)
    const brandsJsonData = await ftechFormat.fetchSakenowaApi(BRANDS_URL)

    // 地域 : 蔵元 => 1:n
    // 蔵元 : 銘柄 => 1:n
    const targetAreaId = await this.choiceSelect(this.#changeKey(areasJsonData.areas), '地域を選択してください')
    const targetBreweries = breweriesJsonData.breweries.filter(({ areaId }) => areaId === targetAreaId)

    // 全銘柄から対象蔵元に紐づく銘柄のみを抽出
    const targetBrands = this.#optimizeBrandsList(brandsJsonData, targetBreweries)
    const targetSakeId = await this.choiceSelectFooter(this.#changeKey(targetBrands), flavorJsonData, '日本酒を選択してください')
    const targetSakeObject = this.#changeKey(targetBrands).filter(({ value }) => value === targetSakeId)
    const targetAreaObject = this.#changeKey(areasJsonData.areas).filter(({ value }) => value === targetAreaId)
    const targetBlandObject = targetBrands.filter(({ id }) => id === targetSakeId)
    const targetBrewerObject = targetBreweries.filter((breweries) => breweries.id === targetBlandObject[0].breweryId)
    const targetFlavorObject = flavorJsonData.flavorCharts.filter(({ brandId }) => brandId === targetBlandObject[0].id)
    return this.#sakeInfo(targetSakeObject[0], targetAreaObject[0], targetBrewerObject[0], targetFlavorObject[0])
  }

  async searchForSakeFromRankings () {
    const ftechFormat = new FtechFormat()
    // さけのわAPIから各種データを取得
    const rankingsJsonData = await ftechFormat.fetchSakenowaApi(RANKINGS_URL)
    const brandsJsonData = await ftechFormat.fetchSakenowaApi(BRANDS_URL)
    // TOP 10に絞る
    const top10Rankings = rankingsJsonData.overall.slice(0, 9)
    console.log(top10Rankings)
    console.log(brandsJsonData.brands.filter(({ id }) => top10Rankings.some((rankings) => rankings.brandId === id)))
  }

  #changeKey (array) {
    const convertArray = array.map(value => {
      return { name: value.name, value: value.id }
    })
    return convertArray
  }

  #optimizeBrandsList (brandsData, breweriesData) {
    return brandsData.brands.filter(({ breweryId }) => breweriesData.some((breweries) => breweryId === breweries.id))
  }

  #sakeInfo (brand, area, breweries, targetFlavor) {
    const f1 = targetFlavor === undefined ? 'undefined' : (Math.round(targetFlavor.f1 * 100) / 10).toFixed(1)
    const f2 = targetFlavor === undefined ? 'undefined' : (Math.round(targetFlavor.f2 * 100) / 10).toFixed(1)
    const f3 = targetFlavor === undefined ? 'undefined' : (Math.round(targetFlavor.f3 * 100) / 10).toFixed(1)
    const f4 = targetFlavor === undefined ? 'undefined' : (Math.round(targetFlavor.f4 * 100) / 10).toFixed(1)
    const f5 = targetFlavor === undefined ? 'undefined' : (Math.round(targetFlavor.f5 * 100) / 10).toFixed(1)
    const f6 = targetFlavor === undefined ? 'undefined' : (Math.round(targetFlavor.f6 * 100) / 10).toFixed(1)
    return '\n' +
      '==================================================\n' +
      '◆　日本酒の情報\n' +
      '==================================================\n' +
      `銘柄   ： ${brand.name}\n` +
      `地域   ： ${area.name}\n` +
      `蔵元   ： ${breweries.name}\n` +
      '--------------------------------------------------\n' +
      `華やか ： ${f1}\n` +
      `芳醇   ： ${f2}\n` +
      `重厚   ： ${f3}\n` +
      `穏やか ： ${f4}\n` +
      `ドライ ： ${f5}\n` +
      `軽快   ： ${f6}\n` +
      '==================================================\n'
  }
}

module.exports = ChoiceFormat
