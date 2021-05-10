google.charts.load('current', { 'packages': ['bar'] })
google.charts.load('current', {'packages':['corechart']})

google.charts.setOnLoadCallback(drawStuff)

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

function options(label){
    let op = {
        is3d: true,
        title: label,
        // colors: ['rgb(255, 81, 0)'],
        width: 400,
        length: 300,
        legend: { position: 'none' },
        chart: {
            title: label,
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
    adjust()
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
    let sfOptions = {
        title: 'Source Forge Downloads',
        curveType: 'function',
        legend: { position: 'bottom' }
      };

    chart = new google.visualization.LineChart(document.getElementById('sf'));
    chart.draw(data, sfOptions)
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

    // Github Juice-shop ----

    // console.log(github)

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
        let done=false
        for(let j=i;j<=x+githubReleases && j<github.length;j++){
            if(done) currData.push(parseInt(github[j],10))
            else currData.push(github[j])
            done=true
            i=j
        }

        githubData.push(currData)
    }
    // console.log(github)
    // console.log(githubData)
    data = new google.visualization.arrayToDataTable(githubData)
    let op = {
        title : 'Github Downloads of juice-shop',
        vAxis: {title: 'Downloads'},
        hAxis: {title: 'Date'},
        seriesType: 'bars',
        series: {30: {type: 'line'}}
      }

    chart = new google.visualization.ComboChart(document.getElementById('gh'))
    chart.draw(data, op)
    // Github Juice-shop ----
    
};


document.onload = adjust
window.onresize = adjust