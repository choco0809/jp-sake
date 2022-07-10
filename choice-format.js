const FetchFormat = require('./fetch-format.js')
const CommonEnquirer = require('./common-enquirer.js')
const SearchForSakenowaInfo = require('./search -for-sakenowa-info.js')

const AREA_URL = 'https://muro.sakenowa.com/sakenowa-data/api/areas'
const BREWERIES_URL = 'https://muro.sakenowa.com/sakenowa-data/api/breweries'
const BRANDS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/brands'
const FLAVOR_URL = 'https://muro.sakenowa.com/sakenowa-data/api/flavor-charts'
const RANKINGS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/rankings'

class ChoiceFormat {
  async searchForSakeFromArea () {
    const fetchFormat = new FetchFormat()
    const areasJsonData = await fetchFormat.fetchSakenowaApi(AREA_URL)
    const commonEnquirer = new CommonEnquirer()
    const targetAreaId = await commonEnquirer.choiceSelect(this.#changeKeyFromIdtoValue(areasJsonData.areas), '地域を選択してください')
    const breweriesJsonData = await fetchFormat.fetchSakenowaApi(BREWERIES_URL)
    const searchForSakenowaInfo = new SearchForSakenowaInfo()
    const targetBreweries = searchForSakenowaInfo.searchForBreweriesFromAreas(targetAreaId, breweriesJsonData.breweries)
    const brandsJsonData = await fetchFormat.fetchSakenowaApi(BRANDS_URL)
    const targetBrandsForArea = searchForSakenowaInfo.searchForBrandsFromBreweries(targetBreweries, brandsJsonData.brands)
    const flavorJsonData = await fetchFormat.fetchSakenowaApi(FLAVOR_URL)
    const targetBlandId = await commonEnquirer.choiceSelectFooter(this.#changeKeyFromIdtoValue(targetBrandsForArea), flavorJsonData, '日本酒を選択してください')
    const targetAreaObject = this.#changeKeyFromIdtoValue(areasJsonData.areas).filter(({ value }) => value === targetAreaId)
    const targetBlandObject = searchForSakenowaInfo.searchForBlandFromBlandsForArea(targetBlandId, targetBrandsForArea)
    const targetBrewerObject = targetBreweries.filter((breweries) => breweries.id === targetBlandObject[0].breweryId)
    const targetFlavorObject = searchForSakenowaInfo.searchForFlavorFromBrand(targetBlandObject[0].id, flavorJsonData.flavorCharts)
    return this.#sakeInfo(targetBlandObject[0].name, targetAreaObject[0].name, targetBrewerObject[0].name, targetFlavorObject[0])
  }

  async searchForSakeFromRankings () {
    const fetchFormat = new FetchFormat()
    const rankingsJsonData = await fetchFormat.fetchSakenowaApi(RANKINGS_URL)
    const top10Rankings = rankingsJsonData.overall.slice(0, 10)
    const brandsJsonData = await fetchFormat.fetchSakenowaApi(BRANDS_URL)
    const searchForSakenowaInfo = new SearchForSakenowaInfo()
    const rankings = searchForSakenowaInfo.searchForBlandsInfoFromRankings(top10Rankings, brandsJsonData.brands)
    const flavorJsonData = await fetchFormat.fetchSakenowaApi(FLAVOR_URL)
    const commonEnquirer = new CommonEnquirer()
    const targetBlandId = await commonEnquirer.choiceSelectFooter(rankings, flavorJsonData, '総合ランキングTOP10')
    const breweriesJsonData = await fetchFormat.fetchSakenowaApi(BREWERIES_URL)
    const targetBrewerObject = searchForSakenowaInfo.searchForBreweryFromBland(targetBlandId, breweriesJsonData.breweries)
    const areasJsonData = await fetchFormat.fetchSakenowaApi(AREA_URL)
    const targetBlandObject = rankings.filter(({ value }) => value === targetBlandId)
    const targetAreaObject = searchForSakenowaInfo.searchForAreaFromBrewery(targetBrewerObject[0].areaId, areasJsonData.areas)
    const targetFlavorObject = searchForSakenowaInfo.searchForFlavorFromBrand(targetBlandId, flavorJsonData.flavorCharts)
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
