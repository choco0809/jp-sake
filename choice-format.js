const fetch = require('node-fetch')
const CommonEnquirer = require('./common-enquirer.js')
const SearchForSakenowaInfo = require('./search-for-sakenowa-info.js')

const AREA_URL = 'https://muro.sakenowa.com/sakenowa-data/api/areas'
const BREWERIES_URL = 'https://muro.sakenowa.com/sakenowa-data/api/breweries'
const BRANDS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/brands'
const FLAVOR_URL = 'https://muro.sakenowa.com/sakenowa-data/api/flavor-charts'
const RANKINGS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/rankings'

class ChoiceFormat {
  constructor () {
    this.searchForSakenowaInfo = new SearchForSakenowaInfo()
    this.commonEnquirer = new CommonEnquirer()
  }

  async searchForSakeFromRankings (targetChoiceType) {
    const targetRankingsAndYearMonth = await this.fetchTargetRankingsAndTargetYearMonth(targetChoiceType)
    const areasJsonData = await this.fetchSakenowaApi(AREA_URL)
    const rankings = await this.fetchTargetRankings(targetRankingsAndYearMonth.rankings)
    const targetBrandAndFlavorObject = await this.fetchTargetBrandIdAndFlavor(rankings, targetRankingsAndYearMonth.yearMonth)
    const targetBrewerObject = await this.fetchTargetBrewery(rankings, targetBrandAndFlavorObject.brandId)
    const targetAreaObject = this.searchForSakenowaInfo.searchForAreaFromBrewery(targetBrewerObject.areaId, areasJsonData.areas)
    return this.#sakeInfo(targetBrandAndFlavorObject.brandName, targetAreaObject.name, targetBrewerObject.name, targetBrandAndFlavorObject.flavor)
  }

  async searchForSakeFromAreasRankings (targetChoiceType) {
    const targetRankingsAndYearMonth = await this.fetchTargetRankingsAndTargetYearMonth(targetChoiceType)
    const areasJsonData = await this.fetchSakenowaApi(AREA_URL)
    const areaRankings = await this.fetchAreaRankings(areasJsonData, targetRankingsAndYearMonth.rankings)
    const rankings = await this.fetchTargetRankings(areaRankings)
    const targetBrandAndFlavorObject = await this.fetchTargetBrandIdAndFlavor(rankings, targetRankingsAndYearMonth.yearMonth)
    const targetBrewerObject = await this.fetchTargetBrewery(rankings, targetBrandAndFlavorObject.brandId)
    const targetAreaObject = this.searchForSakenowaInfo.searchForAreaFromBrewery(targetBrewerObject.areaId, areasJsonData.areas)
    return this.#sakeInfo(targetBrandAndFlavorObject.brandName, targetAreaObject.name, targetBrewerObject.name, targetBrandAndFlavorObject.flavor)
  }

  async fetchSakenowaApi (url) {
    const response = await fetch(url)
    return response.json()
  }

  async fetchTargetRankings (targetRankings) {
    const brandsJsonData = await this.fetchSakenowaApi(BRANDS_URL)
    const choiceRankings = this.searchForSakenowaInfo.searchForBrandsInfoFromRankings(targetRankings, brandsJsonData.brands)
    return choiceRankings
  }

  async fetchTargetRankingsAndTargetYearMonth (targetChoiceType) {
    const rankingsJsonData = await this.fetchSakenowaApi(RANKINGS_URL)
    const targetRankings = this.#fetchChoiceRankings(targetChoiceType, rankingsJsonData)
    const targetYearMonth = rankingsJsonData.yearMonth
    const targetRankingsAndYearMonth = { rankings: targetRankings, yearMonth: targetYearMonth }
    return targetRankingsAndYearMonth
  }

  async fetchAreaRankings (areasJsonData, targetRankings) {
    const targetAreaId = await this.commonEnquirer.choiceSelect(this.#changeKeyFromIdtoValue(areasJsonData.areas), '地域を選択してください')
    const areaRankings = targetRankings.filter(({ areaId }) => areaId === targetAreaId)[0].ranking.slice(0, 10)
    return areaRankings
  }

  async fetchTargetBrandIdAndFlavor (rankings, targetYearMonth) {
    const flavorJsonData = await this.fetchSakenowaApi(FLAVOR_URL)
    const targetBrandId = await this.commonEnquirer.choiceSelectFooter(rankings, flavorJsonData, `【 ${targetYearMonth} 】ランキングTOP10`)
    const targetBrandName = rankings.filter(({ value }) => value === targetBrandId)[0].brandName
    const targetFlavor = this.searchForSakenowaInfo.searchForFlavorFromBrand(targetBrandId, flavorJsonData.flavorCharts)[0]
    const targetBrandIdAndFlavor = { brandId: targetBrandId, brandName: targetBrandName, flavor: targetFlavor }
    return targetBrandIdAndFlavor
  }

  async fetchTargetBrewery (rankings, brandId) {
    const breweriesJsonData = await this.fetchSakenowaApi(BREWERIES_URL)
    const targetBreweyId = rankings.filter(({ value }) => brandId === value)
    const targetBrewerObject = this.searchForSakenowaInfo.searchForBreweryFromBrand(targetBreweyId[0].breweryId, breweriesJsonData.breweries)[0]
    return targetBrewerObject
  }

  #changeKeyFromIdtoValue (array) {
    const convertArray = array.map(value => {
      return { name: value.name, value: value.id }
    })
    return convertArray
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
