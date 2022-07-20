#!/usr/bin/env node

const ChoiceFormat = require('./choice-format.js')
const CommonEnquirer = require('./common-enquirer.js')
const TOP_CHOICE_MESSAGE = '総合ランキング、地域ランキングからあなたにおすすめの日本酒を調べます'
const TOP_CHOICE_LIST = [
  { name: '総合ランキングから探す', value: 'Rankings' },
  { name: '地域ランキングから探す', value: 'AreasRankings' }
]

async function main () {
  const choiceFormat = new ChoiceFormat()
  const commonEnquirer = new CommonEnquirer()
  const choiceType = await commonEnquirer.choiceSelect(TOP_CHOICE_LIST, TOP_CHOICE_MESSAGE)
  if (choiceType === 'Rankings') {
    return await choiceFormat.searchForSakeFromRankings()
  } else if (choiceType === 'AreasRankings') {
    return await choiceFormat.searchForSakeFromAreasRankings()
  }
}

main()
  .then(r => console.log(r))
