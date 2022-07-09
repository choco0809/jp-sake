const ChoiceFormat = require('./choice-format.js')
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
    return await choiceFormat.searchForSakeFromRankings()
  } else if (choiceType === 'areas') {
    return await choiceFormat.searchForSakeFromArea()
  } else if (choiceType === 'flavors') {
    console.log(choiceType)
  }
}

main()
  .then(r => console.log(r))
