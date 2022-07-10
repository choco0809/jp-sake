const fetch = require('node-fetch')

class FetchFormat {
  // APIからURLに対応するjsonデータを取得する
  async fetchSakenowaApi (url) {
    const response = await fetch(url)
    return response.json()
  }
}

module.exports = FetchFormat
