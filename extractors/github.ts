/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs'

const urlJs = 'https://api.github.com/repos/juice-shop/juice-shop/releases'

const collectData = async (): Promise<void> => {
  const githubDataJsRaw = fs.readFileSync('statsData/githubJs.json')
  const githubDataJsString = githubDataJsRaw.toString()
  const githubDataJs = JSON.parse(githubDataJsString) as Record<string, any>
  const date = new Date(Date.now()).toISOString().split('T')[0]
  const prevDate = new Date(Date.now())
  prevDate.setDate(prevDate.getDate() - 1)
  const prevDateString = prevDate.toISOString().split('T')[0]

  const prevJsData = Array.isArray(githubDataJs[prevDateString]) ? githubDataJs[prevDateString] : []

  let dataJs: any[] = []
  await fetch(urlJs)
    .then(async (data) => await data.json())
    .then((data) => {
      dataJs = data
    })

  githubDataJs[date] = []

  for (let i = 0; i < dataJs.length; i++) {
    const tag = dataJs[i].name
    let downloads = 0
    for (let j = 0; j < dataJs[i].assets.length; j++) {
      const count = dataJs[i].assets[j].download_count
      downloads += typeof count === 'number' ? count : 0
    }
    let previousDownloads = 0
    for (let j = 0; j < prevJsData.length; j++) {
      if (prevJsData[j][0] === tag) {
        previousDownloads = prevJsData[j][2]
        break
      }
    }

    githubDataJs[date].push([
      tag,
      downloads - previousDownloads,
      downloads
    ])
  }

  fs.writeFileSync('statsData/githubJs.json', JSON.stringify(githubDataJs))
}

const fetchData = (): { data: string[][], releases: number } => {
  const githubDataJsRaw = fs.readFileSync('statsData/githubJs.json')
  const githubDataJsString = githubDataJsRaw.toString()
  const githubDataJs = JSON.parse(githubDataJsString)

  const data = []
  const dates = Object.getOwnPropertyNames(githubDataJs)
  const releases = ['v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v18'] as const
  type Release = (typeof releases)[number]
  data.push([...releases])

  for (const date of dates) {
    const downloadsPerReleaseByDay = [date]
    const downloadsPerRelease: Record<Release, number> = { v9: 0, v10: 0, v11: 0, v12: 0, v13: 0, v14: 0, v15: 0, v16: 0, v17: 0, v18: 0 }
    for (const release of releases) {
      for (const data of githubDataJs[date]) {
        if (typeof data[0] === 'string' && data[0].startsWith(release)) {
          downloadsPerRelease[release] += data[1]
        }
      }
    }
    downloadsPerReleaseByDay.push(
      ...Object.values(downloadsPerRelease).map(String)
    )
    data.push(downloadsPerReleaseByDay)
  }
  return {
    data,
    releases: releases.length
  }
}

export { collectData, fetchData }
