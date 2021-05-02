google.charts.load('current', { 'packages': ['bar'] });
google.charts.setOnLoadCallback(drawStuff);

function drawStuff() {
    npm = npm.split(',')
    let npmData = []
    npmData.push(['Date', 'Downloads'])
    for (let i = 0; i < npm.length; i += 2) {
        npmData.push([npm[i], parseInt(npm[i + 1], 10)])
    }
    console.log(npmData)
    let data = new google.visualization.arrayToDataTable(npmData);


    let options = {
        is3d: true,
        title: 'Npm Downloads for juice-shop-ctf-cli',
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
    };

    let chart = new google.charts.Bar(document.getElementById('top_x_div'));
    chart.draw(data, options);

    sf = sf.split(',')
    let sfData = []
    sfData.push(['Date', 'Downloads'])
    for (let i = 0; i < sf.length; i += 2) {
        sfData.push([sf[i].split(' ')[0], parseInt(sf[i + 1], 10)])
    }
    console.log(sfData)
    let ndata = new google.visualization.arrayToDataTable(sfData);

    options = {

        title: 'SourceForge Downloads for juice-shop',
        colors:['rgb(255, 81, 0)'],
        width: 400,
        length: 300,
        legend: { position: 'none' },
        chart: {
            // title: 'Sourceforge downloads for the juice-shop app',
            // subtitle: 'Source Forge'
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

    let nchart = new google.charts.Bar(document.getElementById('sf'));
    nchart.draw(ndata, options);
};