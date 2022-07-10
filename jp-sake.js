const ChoiceFormat = require('./choice-format.js')
const CommonEnquirer = require('./common-enquirer.js')
const TOP_CHOICE_MESSAGE = '総合ランキング、地域、フレーバーからあなたにおすすめの日本酒を調べます'
const TOP_CHOICE_LIST = [
  { name: '総合ランキング', value: 'rankings' },
  { name: '地域', value: 'areas' },
  { name: 'フレーバー', value: 'flavors' }
]

async function main () {
  const choiceFormat = new ChoiceFormat()
  const commonEnquirer = new CommonEnquirer()
  const choiceType = await commonEnquirer.choiceSelect(TOP_CHOICE_LIST, TOP_CHOICE_MESSAGE)
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
