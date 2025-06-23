/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs'
const url = 'https://api.npmjs.org/downloads/point/'
const packageName = 'juice-shop-ctf-cli'

type StatsData = Array<[string, number]>

const collectData = async (): Promise<void> => {
  const downloads: any[] = JSON.parse(
    fs.readFileSync('statsData/npm.json', 'utf-8')
  )
  const date = new Date(Date.now())
  date.setDate(date.getDate() - 1)
  const dateString = date.toISOString().split('T')[0]
  const dates = [dateString]
  for (const date of dates) {
    const ExtractUrl = `${url}${date}:${date}/${packageName}`
    await fetch(ExtractUrl)
      .then(async (data) => await data.json())
      .then((data) => {
        let there = false
        for (let i = 0; i < downloads.length; i++) {
          if (downloads[i][0] === date) {
            there = true
          }
        }
        if (!there) {
          downloads.push([date, data.downloads])
        }
      })
  }
  const downloadsString = JSON.stringify(downloads)
  fs.writeFileSync('statsData/npm.json', downloadsString)
}

const getStats = (): StatsData => {
  // const sd = new Date(startDate)
  // const ed = new Date(endDate)
  // const dates = []
  // for(let d = sd;d<= ed;d.setDate(d.getDate()+1)){
  //     dates.push(`${d.toISOString().split('T')[0]}`)
  // }
  const fileContent = fs.readFileSync('statsData/npm.json', 'utf-8')
  const data = JSON.parse(fileContent) as StatsData

  return data
}

export { collectData, getStats }
