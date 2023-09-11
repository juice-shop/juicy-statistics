/*
 * Copyright (c) 2021-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
google.charts.load('current', {'packages':['corechart']})
google.charts.setOnLoadCallback(drawCharts)

const adjust = () => {
    let width
    if(window.innerWidth <= 900){
        width = "100%"
    }
    else{
        width = "50%"
    }

    let graphs = document.getElementsByClassName('graph')
    for(const graph of graphs){
        graph.style.width = width
    }

}

function drawCharts() {

    //  Npm ----
    adjust()
    npm = npm.split(',')
    let npmData = []
    npmData.push(['Date', 'Downloads'])
    for (let i = 0; i < npm.length; i += 2) {
        npmData.push([npm[i], parseInt(npm[i + 1], 10)])
    }
    let data = new google.visualization.arrayToDataTable(npmData)

    let chart = new google.visualization.LineChart(document.getElementById('npm'))
    chart.draw(data, {
        title: 'npm downloads (juice-shop-ctf-cli)',
        lineWidth: 0.5,
        legend: { position: 'bottom' }
    })

    // SourceForge ----
    sf = sf.split(',')
    let sfData = []
    sfData.push(['Date', 'Downloads'])
    for (let i = 0; i < sf.length; i += 2) {
        sfData.push([sf[i].split(' ')[0], parseInt(sf[i + 1], 10)])
    }
    data = new google.visualization.arrayToDataTable(sfData)
    chart = new google.visualization.LineChart(document.getElementById('sf'));
    chart.draw(data, {
        title: 'SourceForge downloads (juice-shop)',
        curveType: 'function',
        legend: { position: 'bottom' }
    })

    // Docker Juice-shop ----
    docJs = docJs.split(',')
    let docJsData = []
    docJsData.push(['Date', 'Downloads'])
    for (let i = 0; i < docJs.length; i += 2) {
        docJsData.push([docJs[i], parseInt(docJs[i + 1], 10)])
    }
    data = new google.visualization.arrayToDataTable(docJsData)

    chart = new google.visualization.LineChart(document.getElementById('docJs'))
    chart.draw(data, {
        title: 'Docker pulls (bkimminich/juice-shop)',
        lineWidth: 0.5,
        legend: { position: 'bottom' },
        vAxis: {
            scaleType: 'log'
        }
    })

    // Docker Juice-shop Ctf ----
    docJsCtf = docJsCtf.split(',')
    let docJsCtfData = []
    docJsCtfData.push(['Date', 'Downloads'])
    for (let i = 0; i < docJsCtf.length; i += 2) {
        docJsCtfData.push([docJsCtf[i], parseInt(docJsCtf[i + 1], 10)])
    }
    data = new google.visualization.arrayToDataTable(docJsCtfData)

    chart = new google.visualization.LineChart(document.getElementById('docJsCtf'))
    chart.draw(data, {
        title: 'Docker pulls (bkimminich/juice-shop-ctf)',
        lineWidth: 0.5,
        legend: { position: 'bottom' },
        vAxis: {
            scaleType: 'log'
        }
    })

    // Github Juice-shop ----
    github = github.split(',')
    let githubData = []
    let releases = ["Date"]
    for(let i=0;i<githubReleases;i++){
        releases.push(github[i])
    }
    githubData.push(releases)
    for(let i=githubReleases;i<github.length;i++){
        let currData = []
        let x=i
        let isDateColumn = true
        for(let j=i;j<=x+githubReleases && j<github.length;j++){
            if(isDateColumn) {
                currData.push(github[j])
            } else {
                const dailyDownloads = parseInt(github[j],10)
                currData.push(dailyDownloads)
            }
            isDateColumn = false
            i=j
        }
        githubData.push(currData)
    }
    data = new google.visualization.arrayToDataTable(githubData)
    chart = new google.visualization.ComboChart(document.getElementById('gh'))
    chart.draw(data, {
        title: 'GitHub release downloads (juice-shop)',
        curveType: 'function',
        vAxis: { title: 'Downloads', scaleType: 'log' },
        hAxis: { title: 'Date' },
        seriesType: 'area',
        lineWidth: 1
    })

    // Challenge Category Distribution ----
    categories = categories.split(",")
    categoriesData = []
    categoriesData.push(['Challenges','Categories Distribution'])
    for (let i = 0; i < categories.length; i += 2) {
        categoriesData.push([categories[i], parseInt(categories[i + 1], 10)])
    }
    data = google.visualization.arrayToDataTable(categoriesData)

    chart = new google.visualization.PieChart(document.getElementById('categories'))
    chart.draw(data, {
        title: 'Challenges Category Distribution'
    })

    // Challenge Tags Distribution ----
    tags = tags.split(",")
    tagsData = []
    tagsData.push(['Challenges','Categories Distribution'])
    for (let i = 0; i < tags.length; i += 2) {
        tagsData.push([tags[i], parseInt(tags[i + 1], 10)])
    }
    data = google.visualization.arrayToDataTable(tagsData)

    chart = new google.visualization.PieChart(document.getElementById('tags'))
    chart.draw(data, {
        title: 'Challenge Tags Distribution'
    })
};


document.onload = adjust
window.onresize = adjust
