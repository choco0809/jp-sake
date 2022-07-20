const FetchFormat = require('./fetch-format.js')
const CommonEnquirer = require('./common-enquirer.js')
const SearchForSakenowaInfo = require('./search-for-sakenowa-info.js')

const AREA_URL = 'https://muro.sakenowa.com/sakenowa-data/api/areas'
const BREWERIES_URL = 'https://muro.sakenowa.com/sakenowa-data/api/breweries'
const BRANDS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/brands'
const FLAVOR_URL = 'https://muro.sakenowa.com/sakenowa-data/api/flavor-charts'
const RANKINGS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/rankings'

class ChoiceFormat {
  constructor () {
    this.fetchFormat = new FetchFormat()
    this.searchForSakenowaInfo = new SearchForSakenowaInfo()
    this.commonEnquirer = new CommonEnquirer()
  }

  async searchForSakeFromRankings () {
    const rankingsJsonData = await this.fetchFormat.fetchSakenowaApi(RANKINGS_URL)
    const yearMonth = rankingsJsonData.yearMonth
    const top10Rankings = rankingsJsonData.overall.slice(0, 10)
    const brandsJsonData = await this.fetchFormat.fetchSakenowaApi(BRANDS_URL)
    const rankings = this.searchForSakenowaInfo.searchForBlandsInfoFromRankings(top10Rankings, brandsJsonData.brands)
    const flavorJsonData = await this.fetchFormat.fetchSakenowaApi(FLAVOR_URL)
    const targetBlandId = await this.commonEnquirer.choiceSelectFooter(rankings, flavorJsonData, `【 ${yearMonth} 】総合ランキングTOP10`)
    const breweriesJsonData = await this.fetchFormat.fetchSakenowaApi(BREWERIES_URL)
    const targetBreweyId = rankings.filter(({ value }) => targetBlandId === value)
    const targetBrewerObject = this.searchForSakenowaInfo.searchForBreweryFromBland(targetBreweyId[0].breweryId, breweriesJsonData.breweries)
    const areasJsonData = await this.fetchFormat.fetchSakenowaApi(AREA_URL)
    const targetBlandObject = rankings.filter(({ value }) => value === targetBlandId)
    const targetAreaObject = this.searchForSakenowaInfo.searchForAreaFromBrewery(targetBrewerObject[0].areaId, areasJsonData.areas)
    const targetFlavorObject = this.searchForSakenowaInfo.searchForFlavorFromBrand(targetBlandId, flavorJsonData.flavorCharts)
    return this.#sakeInfo(targetBlandObject[0].brandName, targetAreaObject[0].name, targetBrewerObject[0].name, targetFlavorObject[0])
  }

  async searchForSakeFromAreasRankings () {
    const rankingsJsonData = await this.fetchFormat.fetchSakenowaApi(RANKINGS_URL)
    const yearMonth = rankingsJsonData.yearMonth
    const areasRankings = rankingsJsonData.areas
    const areasJsonData = await this.fetchFormat.fetchSakenowaApi(AREA_URL)
    const targetAreaId = await this.commonEnquirer.choiceSelect(this.#changeKeyFromIdtoValue(areasJsonData.areas), '地域を選択してください')
    const areaRankings = areasRankings.filter(({ areaId }) => areaId === targetAreaId)
    const brandsJsonData = await this.fetchFormat.fetchSakenowaApi(BRANDS_URL)
    const rankings = this.searchForSakenowaInfo.searchForBlandsInfoFromRankings(areaRankings[0].ranking.slice(0, 10), brandsJsonData.brands)
    const flavorJsonData = await this.fetchFormat.fetchSakenowaApi(FLAVOR_URL)
    const targetBlandId = await this.commonEnquirer.choiceSelectFooter(rankings, flavorJsonData, `【 ${yearMonth} 】ランキングTOP10`)
    const targetBreweyId = rankings.filter(({ value }) => targetBlandId === value)
    const breweriesJsonData = await this.fetchFormat.fetchSakenowaApi(BREWERIES_URL)
    const targetBrewerObject = this.searchForSakenowaInfo.searchForBreweryFromBland(targetBreweyId[0].breweryId, breweriesJsonData.breweries)
    const targetBlandObject = rankings.filter(({ value }) => value === targetBlandId)
    const targetAreaObject = this.searchForSakenowaInfo.searchForAreaFromBrewery(targetBrewerObject[0].areaId, areasJsonData.areas)
    const targetFlavorObject = this.searchForSakenowaInfo.searchForFlavorFromBrand(targetBlandId, flavorJsonData.flavorCharts)
    return this.#sakeInfo(targetBlandObject[0].brandName, targetAreaObject[0].name, targetBrewerObject[0].name, targetFlavorObject[0])
  }

  #changeKeyFromIdtoValue (array) {
    const convertArray = array.map(value => {
      return { name: value.name, value: value.id }
    })
    return convertArray
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
      `銘柄   ： ${brand}\n` +
      `地域   ： ${area}\n` +
      `蔵元   ： ${breweries}\n` +
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
