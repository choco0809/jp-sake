const ChoiceFormat = require('./choice-format.js')
const CommonEnquirer = require('./common-enquirer.js')
const TOP_CHOICE_MESSAGE = '総合ランキング、地域からあなたにおすすめの日本酒を調べます'
const TOP_CHOICE_LIST = [
  { name: '総合ランキングから探す', value: 'Rankings' },
  { name: '地域ランキングから探す', value: 'AreasRankings' },
  { name: '地域から探す', value: 'Areas' }
]

async function main () {
  const choiceFormat = new ChoiceFormat()
  const commonEnquirer = new CommonEnquirer()
  const choiceType = await commonEnquirer.choiceSelect(TOP_CHOICE_LIST, TOP_CHOICE_MESSAGE)
  if (choiceType === 'Rankings') {
    return await choiceFormat.searchForSakeFromRankings()
  } else if (choiceType === 'AreasRankings') {
    return await choiceFormat.searchForSakeFromAreasRankings()
  } else if (choiceType === 'Areas') {
    return await choiceFormat.searchForSakeFromArea()
  }
}

main()
  .then(r => console.log(r))
