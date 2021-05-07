google.charts.load('current', { 'packages': ['bar'] });
google.charts.setOnLoadCallback(drawStuff);

function options(label){
    let op = {
        is3d: true,
        title: label,
        colors: ['rgb(255, 81, 0)'],
        width: 400,
        length: 300,
        legend: { position: 'none' },
        chart: {
            // title: 'Downloads for juice-shop-ctf-cli',
            // subtitle: 'Npm'
        },
        bars: 'vertical',
        axes: {
            x: {
                0: { side: 'bottom', label: 'Dates' }
            },
            y: {
                0: { side: 'left', label: 'Downloads' }
            }
        },
        bar: { groupWidth: "90%" }
    }

    return op
}

function drawStuff() {

    //  Npm ----
    npm = npm.split(',')
    let npmData = []
    npmData.push(['Date', 'Downloads'])
    for (let i = 0; i < npm.length; i += 2) {
        npmData.push([npm[i], parseInt(npm[i + 1], 10)])
    }
    // console.log(npmData)
    let data = new google.visualization.arrayToDataTable(npmData)

    let chart = new google.charts.Bar(document.getElementById('npm'))
    chart.draw(data, options('Npm Downloads for juice-shop-ctf-cli'))
    // Npm ----

    // SourceForge ----
    sf = sf.split(',')
    let sfData = []
    sfData.push(['Date', 'Downloads'])
    for (let i = 0; i < sf.length; i += 2) {
        sfData.push([sf[i].split(' ')[0], parseInt(sf[i + 1], 10)])
    }
    // console.log(sfData)
    data = new google.visualization.arrayToDataTable(sfData)

    chart = new google.charts.Bar(document.getElementById('sf'))
    chart.draw(data, options('SourceForge Downloads for juice-shop'))
    // SourceForge ----

    // Docker Juice-shop ----
    docJs = docJs.split(',')
    let docJsData = []
    docJsData.push(['Date', 'Downloads'])
    for (let i = 0; i < docJs.length; i += 2) {
        docJsData.push([docJs[i], parseInt(docJs[i + 1], 10)])
    }
    console.log(docJsData)
    data = new google.visualization.arrayToDataTable(docJsData)

    chart = new google.charts.Bar(document.getElementById('docJs'))
    chart.draw(data, options('Docker Pulls for the juice-shop'))

    // Docker Juice-shop ----

    // Docker Juice-shop Ctf ----
    docJsCtf = docJsCtf.split(',')
    let docJsCtfData = []
    docJsCtfData.push(['Date', 'Downloads'])
    for (let i = 0; i < docJsCtf.length; i += 2) {
        docJsCtfData.push([docJsCtf[i], parseInt(docJsCtf[i + 1], 10)])
    }
    // console.log(docJsCtfData)
    data = new google.visualization.arrayToDataTable(docJsCtfData)

    chart = new google.charts.Bar(document.getElementById('docJsCtf'))
    chart.draw(data, options('Docker Pulls for the juice-shop Ctf extension'))

    // Docker Juice-shop Ctf ----
};