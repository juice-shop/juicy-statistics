const fetch = require('node-fetch')
const url = 'https://api.npmjs.org/downloads/point/'
const packageName = 'juice-shop-ctf-cli'

const extractStats = async (startDate,endDate) => {
    const downloads = []
    const sd = new Date(startDate)
    const ed = new Date(endDate)
    const dates = []
    for(let d = sd;d<= ed;d.setDate(d.getDate()+1)){
        dates.push(`${d.toISOString().split('T')[0]}`)
    }
    for(const date of dates){
        let ExtractUrl = `${url}${date}:${date}/${packageName}`
            await fetch(ExtractUrl).then(
                data => data .json()
            ).then(
                (data) => {
                    downloads.push([date,data.downloads])
                }
            )
    }
    return downloads
}

module.exports = extractStats