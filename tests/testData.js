/*
 * Copyright (c) 2021-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const chai = require('chai')
const sinonChai = require('sinon-chai')
const expect = chai.expect
chai.use(sinonChai)
const fs = require('fs')
const fetch = require('node-fetch')

let data = fs.readFileSync('statsData/npm.json')
data = JSON.parse(data)

describe('test correctness of the data', () => {
  describe('for npm', () => {
    it('should match with the data on server', async () => {
      // const dates = Object.getOwnPropertyNames(data)

      for (const record of data) {
        const date = record[0]
        const downloads = record[1]
        const ExtractUrl = `https://api.npmjs.org/downloads/point/${date}:${date}/juice-shop-ctf-cli`
        await fetch(ExtractUrl).then(
          npmData => npmData.json()
        ).then(
          (npmData) => {
            expect(npmData.downloads).to.equal(downloads)
          }
        )
      }
    }).timeout(100000)
    it('should have data for all the dates', () => {
      const startDate = new Date('2021-04-05')
      const endDate = new Date(Date.now())
      endDate.setDate(endDate.getDate() - 1)

      for (let date = startDate, c = 0; date < endDate; date.setDate(date.getDate() + 1), c++) { // eslint-disable-line no-unmodified-loop-condition
        const currDate = date.toISOString().split('T')[0]
        expect(currDate).to.equal(data[c][0])
      }
    })
  })
})
