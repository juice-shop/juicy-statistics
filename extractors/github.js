const fetch = require('node-fetch')
const fs = require('fs')

let githubDataJs = fs.readFileSync('statsData/githubJs.json')
githubDataJs =  githubDataJs.toString()
githubDataJs = JSON.parse(githubDataJs)
let githubDataJsCtf = fs.readFileSync('statsData/githubJsCtf.json')
githubDataJsCtf = JSON.parse(githubDataJsCtf)
const urlJs = 'https://api.github.com/repos/bkimminich/juice-shop/releases'
const urlJsCtf = 'https://api.github.com/repos/bkimminich/juice-shop-ctf/releases'

const collectData = async () => {
    let date = new Date(Date.now()).toISOString().split('T')[0]
    let prevDate = new Date(Date.now())
    prevDate.setDate(prevDate.getDate() -1)
    prevDate = prevDate.toISOString().split('T')[0]

    let prevJsData = githubDataJs[prevDate] || {}
    let prevJsCtfData = githubDataJsCtf[prevDate] || {}
    

    let dataJs
    await fetch(urlJs).then(
        (data) => data.json()
    ).then(
        (data) => {
            dataJs = data
        }
    )

    let dataJsCtf
    await fetch(urlJsCtf).then(
        (data) => data.json()
    ).then(
        (data) => {
            dataJsCtf = data
        }
    )

    githubDataJs[date] = []
    githubDataJsCtf[date] = []

    for(let i=0;i<dataJs.length;i++){
        let tag = dataJs[i].name
        let downloads = 0
        for(let j=0;j<dataJs[i].assets.length;j++){
            downloads += dataJs[i].assets[j].download_count
        }
        githubDataJs[date].push([tag,downloads - (prevJsData[i][2] || 0) , downloads])
    }

    githubDataJs = JSON.stringify(githubDataJs)
    fs.writeFileSync('statsData/githubJs.json',githubDataJs)

    for(let i=0;i<dataJsCtf.length;i++){
        let tag = dataJsCtf[i].name
        let downloads = 0
        for(let j=0;j<dataJsCtf[i].assets.length;j++){
            downloads += dataJsCtf[i].assets[j].download_count
        }
        githubDataJsCtf[date].push([tag,downloads - (prevJsCtfData[i][2] || 0) ,downloads])
    }

    githubDataJsCtf = JSON.stringify(githubDataJsCtf)

    fs.writeFileSync('statsData/githubJsCtf.json',githubDataJsCtf)
}

module.exports.collect = collectData