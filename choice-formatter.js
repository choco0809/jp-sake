const fetch = require('node-fetch')
const EnquirerFormatter = require('./enquirer-formatter.js')
const FindingDataToBeLined = require('./finding-data-to-be-lined.js')

const AREA_URL = 'https://muro.sakenowa.com/sakenowa-data/api/areas'
const BREWERIES_URL = 'https://muro.sakenowa.com/sakenowa-data/api/breweries'
const BRANDS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/brands'
const FLAVOR_URL = 'https://muro.sakenowa.com/sakenowa-data/api/flavor-charts'
const RANKINGS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/rankings'

class ChoiceFormatter {
  constructor () {
    this.findingDataToBeLined = new FindingDataToBeLined()
    this.enquirerFormatter = new EnquirerFormatter()
  }

  async searchForSakeFromRankings (targetChoiceType) {
    const targetRankingsAndYearMonth = await this.#fetchTargetRankingsAndTargetYearMonth(targetChoiceType)
    const areasJsonData = await this.#fetchSakenowaApi(AREA_URL)
    const rankings = await this.#fetchTargetRankings(targetRankingsAndYearMonth.rankings)
    const targetBrandAndFlavorObject = await this.#fetchTargetBrandAndFlavor(rankings, targetRankingsAndYearMonth.yearMonth)
    const targetBrewerObject = await this.#fetchTargetBrewery(rankings, targetBrandAndFlavorObject.brandId)
    const targetAreaObject = this.findingDataToBeLined.searchForAreaFromBrewery(targetBrewerObject.areaId, areasJsonData.areas)
    return this.#sakeInfo(targetBrandAndFlavorObject.brandName, targetAreaObject.name, targetBrewerObject.name, targetBrandAndFlavorObject.flavor)
  }

  async searchForSakeFromAreasRankings (targetChoiceType) {
    const targetRankingsAndYearMonth = await this.#fetchTargetRankingsAndTargetYearMonth(targetChoiceType)
    const areasJsonData = await this.#fetchSakenowaApi(AREA_URL)
    const areaRankings = await this.#fetchAreaRankings(areasJsonData, targetRankingsAndYearMonth.rankings)
    const rankings = await this.#fetchTargetRankings(areaRankings)
    const targetBrandAndFlavorObject = await this.#fetchTargetBrandAndFlavor(rankings, targetRankingsAndYearMonth.yearMonth)
    const targetBrewerObject = await this.#fetchTargetBrewery(rankings, targetBrandAndFlavorObject.brandId)
    const targetAreaObject = this.findingDataToBeLined.searchForAreaFromBrewery(targetBrewerObject.areaId, areasJsonData.areas)
    return this.#sakeInfo(targetBrandAndFlavorObject.brandName, targetAreaObject.name, targetBrewerObject.name, targetBrandAndFlavorObject.flavor)
  }

  async #fetchSakenowaApi (url) {
    const response = await fetch(url)
    return response.json()
  }

  async #fetchTargetRankings (targetRankings) {
    const brandsJsonData = await this.#fetchSakenowaApi(BRANDS_URL)
    return this.findingDataToBeLined.searchForBrandsInfoFromRankings(targetRankings, brandsJsonData.brands)
  }

  async #fetchTargetRankingsAndTargetYearMonth (targetChoiceType) {
    const rankingsJsonData = await this.#fetchSakenowaApi(RANKINGS_URL)
    const targetRankings = this.#fetchChoiceRankings(targetChoiceType, rankingsJsonData)
    const targetYearMonth = rankingsJsonData.yearMonth
    return { rankings: targetRankings, yearMonth: targetYearMonth }
  }

  async #fetchAreaRankings (areasJsonData, targetRankings) {
    const targetAreaId = await this.enquirerFormatter.choiceSelect(this.#changeKeyFromIdtoValue(areasJsonData.areas), '?????????????????????????????????')
    return targetRankings.filter(({ areaId }) => areaId === targetAreaId)[0].ranking.slice(0, 10)
  }

  async #fetchTargetBrandAndFlavor (rankings, targetYearMonth) {
    const flavorJsonData = await this.#fetchSakenowaApi(FLAVOR_URL)
    const targetBrandId = await this.enquirerFormatter.choiceSelectFooter(rankings, flavorJsonData, `??? ${targetYearMonth} ??????????????????TOP10`)
    const targetBrandName = rankings.filter(({ value }) => value === targetBrandId)[0].brandName
    const targetFlavor = this.findingDataToBeLined.searchForFlavorFromBrand(targetBrandId, flavorJsonData.flavorCharts)[0]
    return { brandId: targetBrandId, brandName: targetBrandName, flavor: targetFlavor }
  }

  async #fetchTargetBrewery (rankings, brandId) {
    const breweriesJsonData = await this.#fetchSakenowaApi(BREWERIES_URL)
    const targetBrewId = rankings.filter(({ value }) => brandId === value)
    return this.findingDataToBeLined.searchForBreweryFromBrand(targetBrewId[0].breweryId, breweriesJsonData.breweries)[0]
  }

  #changeKeyFromIdtoValue (array) {
    return array.map(value => {
      return { name: value.name, value: value.id }
    })
  }

  #fetchChoiceRankings (targetChoiceType, rankingsJsonData) {
    return (targetChoiceType === 'Rankings') ? rankingsJsonData.overall.slice(0, 10) : rankingsJsonData.areas
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
      '????????????????????????\n' +
      '==================================================\n' +
      `??????   ??? ${brand}\n` +
      `??????   ??? ${area}\n` +
      `??????   ??? ${breweries}\n` +
      '--------------------------------------------------\n' +
      `????????? ??? ${f1}\n` +
      `??????   ??? ${f2}\n` +
      `??????   ??? ${f3}\n` +
      `????????? ??? ${f4}\n` +
      `????????? ??? ${f5}\n` +
      `??????   ??? ${f6}\n` +
      '==================================================\n'
  }
}

module.exports = ChoiceFormatter
