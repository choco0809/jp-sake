const { Select } = require('enquirer')
const FtechFormat = require('./fetch-format.js')
const AREA_URL = 'https://muro.sakenowa.com/sakenowa-data/api/areas'
const BREWERIES_URL = 'https://muro.sakenowa.com/sakenowa-data/api/breweries'
const BRANDS_URL = 'https://muro.sakenowa.com/sakenowa-data/api/brands'
const FLAVOR_URL = 'https://muro.sakenowa.com/sakenowa-data/api/flavor-charts'

class ChoiceFormat {
  async choiceSelect (choicesList, topChoiceMassage) {
    return new Promise(resolve => {
      const prompt = new Select({
        message: topChoiceMassage,
        // limitを指定しないと、messageが重複して出力されてしまう
        limit: 15,
        choices: choicesList,
        result () {
          // nameに対応するvalueを返す
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
          const f1 = targetFlavor[0] === undefined ? 'undefined' : targetFlavor[0].f1
          const f2 = targetFlavor[0] === undefined ? 'undefined' : targetFlavor[0].f2
          const f3 = targetFlavor[0] === undefined ? 'undefined' : targetFlavor[0].f3
          const f4 = targetFlavor[0] === undefined ? 'undefined' : targetFlavor[0].f4
          const f5 = targetFlavor[0] === undefined ? 'undefined' : targetFlavor[0].f5
          const f6 = targetFlavor[0] === undefined ? 'undefined' : targetFlavor[0].f6
          return '------------------------------\n' +
                   `華やか  ：${f1}\n` +
                   `芳醇    ：${f2}\n` +
                   `重厚    ：${f3}\n` +
                   `穏やか  ：${f4}\n` +
                   `ドライ  ：${f5}\n` +
                   `軽快    ：${f6}\n`
        },
        // limitを指定しないと、messageが重複して出力されてしまう
        limit: 15,
        choices: choicesList,
        result () {
          // nameに対応するvalueを返す
          return this.focused.value
        }
      })
      prompt.run()
        .then(answer => { resolve(answer) })
    })
  }


  async searchForSakeFromArea (){
    const ftechFormat = new FtechFormat
    // 地域取得
    const areasJsonData = await ftechFormat.fetchSakenowaApi(AREA_URL)
    const targetAreaId = await this.choiceSelect(this.#changeKey(areasJsonData.areas),`地域を選択してください`)

    // 地域に存在する蔵元で作成している日本酒を紐づけ
    const flavorJsonData = await ftechFormat.fetchSakenowaApi(FLAVOR_URL) // フッターでフレーバー情報を使用するためthis
    const breweriesJsonData = await ftechFormat.fetchSakenowaApi(BREWERIES_URL)
    const brandsJsonData = await ftechFormat.fetchSakenowaApi(BRANDS_URL)
    const targetBreweries = breweriesJsonData.breweries.filter(({ areaId }) => areaId === targetAreaId )
    const targetBrandsList = this.#optimizeBrandsList(brandsJsonData, targetBreweries)

    const targetSake = await this.choiceSelectFooter(this.#changeKey(targetBrandsList),flavorJsonData,'日本酒を選択してください')
    const targetSakeName = this.#changeKey(targetBrandsList).filter(({value}) =>  value === targetSake)
    const targetAreaName = this.#changeKey(areasJsonData.areas).filter(({value}) => value === targetAreaId )

    console.log(targetSake)
    // const targetBreweriesName = targetBrandsList.filter(({value}) => value === targetSake)

  }

  #changeKey (array) {
    const convert_array = array.map(value => {
      return { name: value.name, value: value.id }
    })
    return convert_array
  }

  #optimizeBrandsList(brandsData, breweriesData) {
    return brandsData.brands.filter(({breweryId}) => breweriesData.some((breweries) => breweryId === breweries.id))
  }

  fetchFravorChart() {
    return 'aaa'
  }

  #printSakeInfo(brand, area, breweries) {
    console.log(
      `\n`+
      `銘柄：${brand}`+
      `地域：${area}`+
      `蔵元：${breweries}`
    )
  }

}

module.exports = ChoiceFormat
