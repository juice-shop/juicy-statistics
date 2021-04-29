const express = require('express')
var path = require('path')
const statsSf = require('./extractors/sourceFourge')
const statsNpm = require('./extractors/npm')
const { env } = require('process')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',async (req,res) => {

    let sourceForge 
    await statsSf('2021-03-28','2021-04-28').then(
        (data) => {
            sourceForge = data
        }
    )
    let npm
    await statsNpm('2021-03-28','2021-04-28').then(
        (data) => {
            npm = data
        }
    )


    res.render('index.ejs',{
        sourceForge: sourceForge,
        npm: npm
    })

    

})

app.listen(env.PORT || 3000)