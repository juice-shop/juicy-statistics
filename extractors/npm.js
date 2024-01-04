/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const fetch = require('node-fetch')
const fs = require('fs')
const url = 'https://api.npmjs.org/downloads/point/'
const packageName = 'juice-shop-ctf-cli'

const collectData = async () => {
  let downloads = fs.readFileSync('statsData/npm.json')
  downloads = JSON.parse(downloads)
  let date = new Date(Date.now())
  date.setDate(date.getDate() - 1)
  date = date.toISOString().split('T')[0]
  const dates = [date]
  for (const date of dates) {
    const ExtractUrl = `${url}${date}:${date}/${packageName}`
    await fetch(ExtractUrl).then(
      data => data.json()
    ).then(
      (data) => {
        let there = false
        for (let i = 0; i < downloads.length; i++) {
          if (downloads[i][0] === date) {
            there = true
          }
        }
        if (!there) {
          downloads.push([date, data.downloads])
        }
      }
    )
  }
  downloads = JSON.stringify(downloads)
  fs.writeFileSync('statsData/npm.json', downloads)
}

const getStats = () => {
  // const sd = new Date(startDate)
  // const ed = new Date(endDate)
  // const dates = []
  // for(let d = sd;d<= ed;d.setDate(d.getDate()+1)){
  //     dates.push(`${d.toISOString().split('T')[0]}`)
  // }

  let data = fs.readFileSync('statsData/npm.json')
  data = JSON.parse(data)

  return data
}

module.exports.getStats = getStats
module.exports.collectData = collectData
