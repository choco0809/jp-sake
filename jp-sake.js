#!/usr/bin/env node

const ChoiceFormatter = require('./choice-formatter.js')
const EnquirerFormatter = require('./enquirer-formatter.js')
const TOP_CHOICE_MESSAGE = '全国総合ランキング、地域ランキングからあなたにおすすめの日本酒を調べます'
const TOP_CHOICE_LIST = [
  { name: '総合ランキングから探す', value: 'Rankings' },
  { name: '地域ランキングから探す', value: 'AreasRankings' }
]

async function main () {
  const choiceFormatter = new ChoiceFormatter()
  const enquirerFormatter = new EnquirerFormatter()
  const choiceType = await enquirerFormatter.choiceSelect(TOP_CHOICE_LIST, TOP_CHOICE_MESSAGE)
  if (choiceType === 'Rankings') {
    return await choiceFormatter.searchForSakeFromRankings(choiceType)
  } else if (choiceType === 'AreasRankings') {
    return await choiceFormatter.searchForSakeFromAreasRankings(choiceType)
  }
}

main()
  .then(r => console.log(r))
