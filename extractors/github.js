const fetch = require('node-fetch')
const fs = require('fs')

const urlJs = 'https://api.github.com/repos/juice-shop/juice-shop/releases'
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
            if(prevJsData[j][0] === tag){
                prev_downloads = prevJsData[j][2]
                break
            }
        }

        githubDataJs[date].push([tag,downloads - (prev_downloads || 0) , downloads])
    }

    githubDataJs = JSON.stringify(githubDataJs)
    fs.writeFileSync('statsData/githubJs.json',githubDataJs)
}

const fetchData = () => {

    let githubDataJs = fs.readFileSync('statsData/githubJs.json')
    githubDataJs =  githubDataJs.toString()
    githubDataJs = JSON.parse(githubDataJs)

    let data = []
    let dates = Object.getOwnPropertyNames(githubDataJs)
    let releases = []
    for(let i=0;i<githubDataJs[dates[dates.length -1]].length;i++){
        releases.push(githubDataJs[dates[dates.length - 1]][i][0])
    }
    data.push(releases)

    for(const date of dates){
        let currData = [date]
        for(const release of releases){
            let done = false
            for(const data of githubDataJs[date]){
                if(data[0] === release){
                    currData.push(data[1])
                    done=true
                    break
                }
            }
            if(!done) currData.push(0)
        }

        data.push(currData)

    }
    return {
        data: data,
        releases: releases.length
    }
    
}
module.exports.collect = collectData
module.exports.fetchData = fetchData