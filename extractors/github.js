/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const fetch = require('node-fetch')
const fs = require('fs')

const urlJs = 'https://api.github.com/repos/juice-shop/juice-shop/releases'

const collectData = async () => {
  let githubDataJs = fs.readFileSync('statsData/githubJs.json')
  githubDataJs = githubDataJs.toString()
  githubDataJs = JSON.parse(githubDataJs)
  const date = new Date(Date.now()).toISOString().split('T')[0]
  let prevDate = new Date(Date.now())
  prevDate.setDate(prevDate.getDate() - 1)
  prevDate = prevDate.toISOString().split('T')[0]

  const prevJsData = githubDataJs[prevDate] || {}

  let dataJs
  await fetch(urlJs).then(
    (data) => data.json()
  ).then(
    (data) => {
      dataJs = data
    }
  )

  githubDataJs[date] = []

  for (let i = 0; i < dataJs.length; i++) {
    const tag = dataJs[i].name
    let downloads = 0
    for (let j = 0; j < dataJs[i].assets.length; j++) {
      downloads += dataJs[i].assets[j].download_count
    }
    let previousDownloads = 0
    for (let j = 0; j < prevJsData.length; j++) {
      if (prevJsData[j][0] === tag) {
        previousDownloads = prevJsData[j][2]
        break
      }
    }

    githubDataJs[date].push([tag, downloads - (previousDownloads || 0), downloads])
  }

  githubDataJs = JSON.stringify(githubDataJs)
  fs.writeFileSync('statsData/githubJs.json', githubDataJs)
}

const fetchData = () => {
  let githubDataJs = fs.readFileSync('statsData/githubJs.json')
  githubDataJs = githubDataJs.toString()
  githubDataJs = JSON.parse(githubDataJs)

  const data = []
  const dates = Object.getOwnPropertyNames(githubDataJs)
  const releases = ['v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17']
  data.push(releases)

  for (const date of dates) {
    const downloadsPerReleaseByDay = [date]
    const downloadsPerRelease = { v9: 0, v10: 0, v11: 0, v12: 0, v13: 0, v14: 0, v15: 0, v16: 0, v17: 0 }
    for (const release of releases) {
      for (const data of githubDataJs[date]) {
        if (data[0].startsWith(release)) {
          downloadsPerRelease[release] += data[1]
        }
      }
    }
    downloadsPerReleaseByDay.push(Object.values(downloadsPerRelease))
    data.push(downloadsPerReleaseByDay)
  }
  return {
    data,
    releases: releases.length
  }
}
module.exports.collect = collectData
module.exports.fetchData = fetchData
