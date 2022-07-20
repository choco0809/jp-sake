class SearchForSakenowaInfo {
  // 地域(areaId)と紐づく蔵元を探す
  searchForBreweriesFromAreas (areaId, breweries) {
    return breweries.filter(breweries => breweries.areaId === areaId)
  }

  // 蔵元に紐づく地域を探す
  searchForAreaFromBrewery (breweryId, areas) {
    return areas.filter(areas => areas.id === breweryId)[0]
  }

  // 蔵元と紐づく銘柄を探す
  searchForBrandsFromBreweries (breweries, brands) {
    return brands.filter(({ breweryId }) => breweries.some(({ id }) => id === breweryId))
  }

  // 銘柄と紐づく蔵元を探す
  searchForBreweryFromBrand (brandId, breweries) {
    return breweries.filter(({ id }) => id === brandId)
  }

  // 銘柄のフレーバー情報を探す
  searchForFlavorFromBrand (brandId, flavors) {
    return flavors.filter(flavors => flavors.brandId === brandId)
  }

  // 複数の銘柄から特定の銘柄を探す
  searchForBrandFromBrandsForArea (brandId, brandsForArea) {
    return brandsForArea.filter(({ id }) => id === brandId)
  }

  // 総合ランキングと紐づく銘柄、蔵元情報を探す
  searchForBrandsInfoFromRankings (rankings, brands) {
    return rankings.filter(rankings => brands.some(function (brands) {
      if (rankings.brandId !== brands.id) return undefined
      rankings.name = `${rankings.rank.toString().padStart(2, ' ')}位：${brands.name}`
      rankings.brandName = brands.name
      rankings.breweryId = brands.breweryId
      rankings.value = brands.id
      delete rankings.rank
      delete rankings.score
      delete rankings.brandId
      return rankings
    }))
  }

  // 地域ランキングと紐づく銘柄、蔵元情報を探す
  searchForBrandsInfoFromAreaRankings (rankings) {
    console.log(rankings[0].ranking)
  }
}

module.exports = SearchForSakenowaInfo
