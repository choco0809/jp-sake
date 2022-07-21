const { Select } = require('enquirer')

class EnquirerFormatter {
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
}

module.exports = EnquirerFormatter
