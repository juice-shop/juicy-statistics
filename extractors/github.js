const fetch = require('node-fetch')
const fs = require('fs')

const urlJs = 'https://api.github.com/repos/bkimminich/juice-shop/releases'
const urlJsCtf = 'https://api.github.com/repos/juice-shop/juice-shop-ctf/releases'

const collectData = async () => {
    let githubDataJs = fs.readFileSync('statsData/githubJs.json')
    githubDataJs =  githubDataJs.toString()
    githubDataJs = JSON.parse(githubDataJs)
    let date = new Date(Date.now()).toISOString().split('T')[0]
    let prevDate = new Date(Date.now())
    prevDate.setDate(prevDate.getDate() -1)
    prevDate = prevDate.toISOString().split('T')[0]

    let prevJsData = githubDataJs[prevDate] || {}
    

    let dataJs
    await fetch(urlJs).then(
        (data) => data.json()
    ).then(
        (data) => {
            dataJs = data
        }
    )

    githubDataJs[date] = []

    for(let i=0;i<dataJs.length;i++){
        let tag = dataJs[i].name
        let downloads = 0
        for(let j=0;j<dataJs[i].assets.length;j++){
            downloads += dataJs[i].assets[j].download_count
        }
        let prev_downloads = 0
        for(let j=0;j<prevJsData.length;j++){
            if(prevJsData[i][0] === tag){
                prev_downloads = prevJsData[i][2]
            }
        }

        githubDataJs[date].push([tag,downloads - (prev_downloads || 0) , downloads])
    }

    githubDataJs = JSON.stringify(githubDataJs)
    fs.writeFileSync('statsData/githubJs.json',githubDataJs)
}

const fetchData = (startDate,endDate ) => {

    let githubDataJs = fs.readFileSync('statsData/githubJs.json')
    githubDataJs =  githubDataJs.toString()
    githubDataJs = JSON.parse(githubDataJs)

    // let data = {}

    return githubDataJs

}
module.exports.collect = collectData
module.exports.fetchData = fetchData