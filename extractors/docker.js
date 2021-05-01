const fetch = require('node-fetch')
const fs = require('fs')

let dockerDataJs = fs.readFileSync('statsData/dockerJs.json')
dockerDataJs =  dockerDataJs.toString()
dockerDataJs = JSON.parse(dockerDataJs)
let dockerDataJsCtf = fs.readFileSync('statsData/dockerJsCtf.json')
dockerDataJsCtf = JSON.parse(dockerDataJsCtf)
const urlJs = 'https://registry.hub.docker.com/v2/repositories/bkimminich/juice-shop/'
const urlJsCtf = 'https://registry.hub.docker.com/v2/repositories/bkimminich/juice-shop-ctf/'

const collectData = async () => {
    let date = new Date(Date.now()).toISOString().split('T')[0]
    let prevDate = new Date(Date.now())
    prevDate.setDate(prevDate.getDate() -1)
    prevDate = prevDate.toISOString().split('T')[0]

    let prevJsData = dockerDataJs[prevDate] || {}
    let prevJsCtfData = dockerDataJsCtf[prevDate] || {}
    

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

    dockerDataJs[date] = [dataJs.pull_count - (prevJsData[1] || 0 ), dataJs.pull_count]
    dockerDataJsCtf[date] = [dataJsCtf.pull_count - (prevJsCtfData[1] || 0 ), dataJsCtf.pull_count]

    dockerDataJs = JSON.stringify(dockerDataJs)
    fs.writeFileSync('statsData/dockerJs.json',dockerDataJs)

    dockerDataJsCtf = JSON.stringify(dockerDataJsCtf)
    fs.writeFileSync('statsData/dockerJsCtf.json',dockerDataJsCtf)
}

module.exports.collect = collectData