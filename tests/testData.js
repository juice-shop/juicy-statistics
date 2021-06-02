const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)
const fs = require('fs')
const fetch = require('node-fetch')
const path = require('path')

let data = fs.readFileSync('statsData/npm.json')
data = JSON.parse(data)

describe("test correctness of the data",() => {
    describe("for npm",()=>{
        it("should match with the data on server",async () => {
            // const dates = Object.getOwnPropertyNames(data)

            for(const record of data){
                let date = record[0]
                let downloads = record[1]
                let ExtractUrl = `https://api.npmjs.org/downloads/point/${date}:${date}/juice-shop-ctf-cli`
                await fetch(ExtractUrl).then(
                    npmData => npmData .json()
                ).then(
                    (npmData) => {
                        expect(npmData.downloads).to.equal(downloads)
                    }
                )
            }

        }).timeout(100000)
        it("should have data for all the dates", () => {
            let startDate = new Date("2021-04-05")
            let endDate = new Date(Date.now())
            endDate.setDate(endDate.getDate() -1)

            for(let date = startDate,c=0;date < endDate;date.setDate(date.getDate()+1),c++) {
                let currDate = date.toISOString().split("T")[0]
                expect(currDate).to.equal(data[c][0])

            }
        })
    })
})