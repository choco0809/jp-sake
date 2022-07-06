const ChoiceFormat = require('./choice-format.js')
const { resolve } = require('eslint-plugin-promise/rules/lib/promise-statics')
const TOP_CHOICE_MESSAGE = '月間ランキング、地域、フレーバーからあなたにおすすめの日本酒を調べます'
const TOP_CHOICE_LIST = [
  { name: '月間ランキング', value: 'rankings' },
  { name: '地域', value: 'areas' },
  { name: 'フレーバー', value: 'flavors' }
]

async function main () {
  const choiceFormat = new ChoiceFormat()
  const choiceType = await choiceFormat.choiceSelect(TOP_CHOICE_LIST, TOP_CHOICE_MESSAGE)
  if (choiceType === 'rankings') {
    console.log(choiceType)
  } else if (choiceType === 'areas') {
    await choiceFormat.searchForSakeFromArea()
  } else if (choiceType === 'flavors') {
    console.log(choiceType)
  }
  return resolve
}

main().then(r => r)
