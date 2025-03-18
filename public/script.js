/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
google.charts.load('current', { packages: ['corechart'] })
google.charts.setOnLoadCallback(drawCharts)

const adjust = () => {
  let width
  if (window.innerWidth <= 900) {
    width = '100%'
  } else {
    width = '50%'
  }

  const graphs = document.getElementsByClassName('graph')
  for (const graph of graphs) {
    graph.style.width = width
  }
}

function drawCharts () {
  //  Npm ----
  adjust()
  npm = npm.split(',')
  const npmData = []
  npmData.push(['Date', 'Downloads'])
  for (let i = 0; i < npm.length; i += 2) {
    npmData.push([npm[i], parseInt(npm[i + 1], 10)])
  }
  let data = google.visualization.arrayToDataTable(npmData)

  let chart = new google.visualization.AreaChart(document.getElementById('npm'))
  chart.draw(data, {
    title: 'npm downloads (juice-shop-ctf-cli)',
    lineWidth: 0.1,
    legend: { position: 'bottom' }
  })

  // SourceForge ----
  sf = sf.split(',')
  const sfData = []
  sfData.push(['Date', 'Downloads'])
  for (let i = 0; i < sf.length; i += 2) {
    sfData.push([sf[i].split(' ')[0], parseInt(sf[i + 1], 10)])
  }
  data = google.visualization.arrayToDataTable(sfData)
  chart = new google.visualization.LineChart(document.getElementById('sf'))
  chart.draw(data, {
    title: 'SourceForge downloads (juice-shop)',
    curveType: 'function',
    legend: { position: 'bottom' }
  })

  // Docker Juice-shop ----
  docJs = docJs.split(',')
  const docJsData = []
  docJsData.push(['Date', 'Downloads'])
  for (let i = 0; i < docJs.length; i += 2) {
    docJsData.push([docJs[i], parseInt(docJs[i + 1], 10)])
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
  docJsCtf = docJsCtf.split(',')
  const docJsCtfData = []
  docJsCtfData.push(['Date', 'Downloads'])
  for (let i = 0; i < docJsCtf.length; i += 2) {
    docJsCtfData.push([docJsCtf[i], parseInt(docJsCtf[i + 1], 10)])
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
  github = github.split(',')
  const githubData = []
  const releases = ['Date']
  for (let i = 0; i < githubReleases; i++) {
    releases.push(github[i])
  }
  githubData.push(releases)
  for (let i = githubReleases; i < github.length; i++) {
    const currData = []
    const x = i
    let isDateColumn = true
    for (let j = i; j <= x + githubReleases && j < github.length; j++) {
      if (isDateColumn) {
        currData.push(github[j])
      } else {
        const dailyDownloads = parseInt(github[j], 10)
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
  categories = categories.split(',')
  const categoriesData = []
  categoriesData.push(['Challenges', 'Categories Distribution'])
  for (let i = 0; i < categories.length; i += 2) {
    categoriesData.push([categories[i], parseInt(categories[i + 1], 10)])
  }
  data = google.visualization.arrayToDataTable(categoriesData)

  chart = new google.visualization.PieChart(document.getElementById('categories'))
  chart.draw(data, {
    title: 'Challenges Category Distribution'
  })

  // Challenge Tags Distribution ----
  tags = tags.split(',')
  const tagsData = []
  tagsData.push(['Challenges', 'Categories Distribution'])
  for (let i = 0; i < tags.length; i += 2) {
    tagsData.push([tags[i], parseInt(tags[i + 1], 10)])
  }
  data = google.visualization.arrayToDataTable(tagsData)

  chart = new google.visualization.PieChart(document.getElementById('tags'))
  chart.draw(data, {
    title: 'Challenge Tags Distribution'
  })

  // Spam issues and Pull Requests ----
  const monthlyData = {};
  spamStats.forEach((entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`; // Format: YYYY-MM

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { spamIssues: 0, spamPRs: 0 };
    }

    monthlyData[monthKey].spamIssues += entry.totalSpamIssues;
    monthlyData[monthKey].spamPRs += entry.totalSpamPRs;
  });
  const spamDataArray = [];
  spamDataArray.push(["Month", "Spam Issues", "Spam PRs"]);
  Object.keys(monthlyData).forEach((month) => {
    spamDataArray.push([
      month,
      monthlyData[month].spamIssues,
      monthlyData[month].spamPRs,
    ]);
  });
  data = google.visualization.arrayToDataTable(spamDataArray);
  chart = new google.visualization.LineChart(
    document.getElementById("spamChart")
  );
  chart.draw(data, {
    title: "Spam Issues and Pull Requests",
    curveType: "none",
    legend: { position: "top" },
    vAxis: {
      title: "Count",
      viewWindow: {
        min: 0,
      },
    },
    series: {
      0: { color: "#E07A5F" },
      1: { color: "#81B29A" },
    },
    lineWidth: 1,
    pointSize: 4,
    tooltip: { trigger: "focus" },
  });
  
}

document.onload = adjust
window.onresize = adjust