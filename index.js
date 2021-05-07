const express = require('express')
var path = require('path')
const statsSf = require('./extractors/sourceForge')
const statsNpm = require('./extractors/npm')
const docker = require('./extractors/docker')
const { env } = require('process')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',async (req,res) => {

    let startDate = new Date(Date.now())
    startDate.setDate(startDate.getDate() - 30)
    startDate = `${startDate.toISOString().split('T')[0]}`
    let endDate = new Date(Date.now())
    endDate = `${endDate.toISOString().split('T')[0]}`

    let sourceForge 
    await statsSf(startDate,endDate).then(
        (data) => {
            sourceForge = data
        }
    )
    let npm = statsNpm.getStats()
    let dockerData = docker.fetchData()


    res.render('index.ejs',{
        sourceForge: sourceForge,
        npm: npm,
        dockerJs: dockerData.jsData,
        dockerJsCtf: dockerData.jsCtfData
    })

    

})

app.listen(env.PORT || 3000)
