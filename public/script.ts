/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

declare const google: any
declare let npm: string
declare let sf: string
declare let docJs: string
declare let docJsCtf: string
declare let github: string
declare let githubReleases: number
declare let categories: string
declare let tags: string
declare let spamStats: Array<{ date: string, totalSpamIssues: number, totalSpamPRs: number }>

google.charts.load('current', { packages: ['corechart'] })
google.charts.setOnLoadCallback(drawCharts)

const adjust = (): void => {
  let width
  if (window.innerWidth <= 900) {
    width = '100%'
  } else {
    width = '50%'
  }

  const graphs = document.getElementsByClassName('graph')
  for (const graph of graphs) {
    (graph as HTMLElement).style.width = width
  }
}

function drawCharts (): void {
  //  Npm ----
  adjust()
  const npmArr = npm.split(',')
  const npmData = []
  npmData.push(['Date', 'Downloads'])
  for (let i = 0; i < npmArr.length; i += 2) {
    npmData.push([npmArr[i], parseInt(npmArr[i + 1], 10)])
  }
  let data = google.visualization.arrayToDataTable(npmData)

  let chart = new google.visualization.AreaChart(document.getElementById('npm'))
  chart.draw(data, {
    title: 'npm downloads (juice-shop-ctf-cli)',
    lineWidth: 0.1,
    legend: { position: 'bottom' }
  })

  // SourceForge ----
  const sfArr = sf.split(',')
  const sfData = []
  sfData.push(['Date', 'Downloads'])
  for (let i = 0; i < sfArr.length; i += 2) {
    sfData.push([sfArr[i].split(' ')[0], parseInt(sfArr[i + 1], 10)])
  }
  data = google.visualization.arrayToDataTable(sfData)
  chart = new google.visualization.LineChart(document.getElementById('sf'))
  chart.draw(data, {
    title: 'SourceForge downloads (juice-shop)',
    curveType: 'function',
    legend: { position: 'bottom' }
  })

  // Docker Juice-shop ----
  const docJsArr = docJs.split(',')
  const docJsData = []
  docJsData.push(['Date', 'Downloads'])
  for (let i = 0; i < docJsArr.length; i += 2) {
    docJsData.push([docJsArr[i], parseInt(docJsArr[i + 1], 10)])
  }
  data = google.visualization.arrayToDataTable(docJsData)

  chart = new google.visualization.AreaChart(document.getElementById('docJs'))
  chart.draw(data, {
    title: 'Docker pulls (bkimminich/juice-shop)',
    lineWidth: 0.1,
    legend: { position: 'bottom' },
    vAxis: {
      scaleType: 'log'
    }
  })

  // Docker Juice-shop Ctf ----
  const docJsCtfArr = docJsCtf.split(',')
  const docJsCtfData = []
  docJsCtfData.push(['Date', 'Downloads'])
  for (let i = 0; i < docJsCtfArr.length; i += 2) {
    docJsCtfData.push([docJsCtfArr[i], parseInt(docJsCtfArr[i + 1], 10)])
  }
  data = google.visualization.arrayToDataTable(docJsCtfData)

  chart = new google.visualization.AreaChart(document.getElementById('docJsCtf'))
  chart.draw(data, {
    title: 'Docker pulls (bkimminich/juice-shop-ctf)',
    lineWidth: 0.1,
    legend: { position: 'bottom' },
    vAxis: {
      scaleType: 'log'
    }
  })

  // Github Juice-shop ----
  const githubArr = github.split(',')
  const githubData = []
  const releases = ['Date']
  for (let i = 0; i < githubReleases; i++) {
    releases.push(githubArr[i])
  }
  githubData.push(releases)
  for (let i = githubReleases; i < githubArr.length; i++) {
    const currData = []
    const x = i
    let isDateColumn = true
    for (let j = i; j <= x + githubReleases && j < githubArr.length; j++) {
      if (isDateColumn) {
        currData.push(githubArr[j])
      } else {
        const dailyDownloads = parseInt(githubArr[j], 10)
        currData.push(dailyDownloads)
      }
      isDateColumn = false
      i = j
    }
    githubData.push(currData)
  }
  data = google.visualization.arrayToDataTable(githubData)
  chart = new google.visualization.ComboChart(document.getElementById('gh'))
  chart.draw(data, {
    title: 'GitHub release downloads (juice-shop)',
    curveType: 'function',
    vAxis: { title: 'Downloads', scaleType: 'log' },
    hAxis: { title: 'Date' },
    seriesType: 'area',
    lineWidth: 0.1
  })

  // Challenge Category Distribution ----
  const categoriesArr = categories.split(',')
  const categoriesData = []
  categoriesData.push(['Challenges', 'Categories Distribution'])
  for (let i = 0; i < categoriesArr.length; i += 2) {
    categoriesData.push([categoriesArr[i], parseInt(categoriesArr[i + 1], 10)])
  }
  data = google.visualization.arrayToDataTable(categoriesData)

  chart = new google.visualization.PieChart(document.getElementById('categories'))
  chart.draw(data, {
    title: 'Challenges Category Distribution'
  })

  // Challenge Tags Distribution ----
  const tagsArr = tags.split(',')
  const tagsData = []
  tagsData.push(['Challenges', 'Categories Distribution'])
  for (let i = 0; i < tagsArr.length; i += 2) {
    tagsData.push([tagsArr[i], parseInt(tagsArr[i + 1], 10)])
  }
  data = google.visualization.arrayToDataTable(tagsData)

  chart = new google.visualization.PieChart(document.getElementById('tags'))
  chart.draw(data, {
    title: 'Challenge Tags Distribution'
  })

  // Spam issues and Pull Requests ----
  const monthlyData: Record<string, { spamIssues: number, spamPRs: number }> = {}
  spamStats.forEach((entry) => {
    const date = new Date(entry.date)
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}` // Format: YYYY-MM

    if (monthlyData[monthKey] === undefined) {
      monthlyData[monthKey] = { spamIssues: 0, spamPRs: 0 }
    }

    monthlyData[monthKey].spamIssues += entry.totalSpamIssues
    monthlyData[monthKey].spamPRs += entry.totalSpamPRs
  })
  const spamDataArray = []
  spamDataArray.push(['Month', 'Spam Issues', 'Spam PRs'])
  Object.keys(monthlyData).forEach((month) => {
    spamDataArray.push([
      month,
      monthlyData[month].spamIssues,
      monthlyData[month].spamPRs
    ])
  })
  data = google.visualization.arrayToDataTable(spamDataArray)
  chart = new google.visualization.LineChart(
    document.getElementById('spamChart')
  )
  chart.draw(data, {
    title: 'Spam Issues and Pull Requests',
    curveType: 'none',
    legend: { position: 'top' },
    vAxis: {
      title: 'Count',
      viewWindow: {
        min: 0
      }
    },
    series: {
      0: { color: '#E07A5F' },
      1: { color: '#81B29A' }
    },
    lineWidth: 1,
    pointSize: 4,
    tooltip: { trigger: 'focus' }
  })
}

document.onload = adjust
window.onresize = adjust
