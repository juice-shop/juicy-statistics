import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync('statsData/npm.json', 'utf-8'))

describe('test correctness of the data', () => {
  describe('for npm', () => {
    test('should match with the data on server', async (t) => {
      const recentData = data.slice(-30)
      for (const [date, downloads] of recentData) {
        const response = await fetch(`https://api.npmjs.org/downloads/point/${date}:${date}/juice-shop-ctf-cli`)
        const npmData = await response.json()
        console.log(`Date: ${date}, Expected: ${downloads}, Actual: ${npmData.downloads}`)
        assert.equal(npmData.downloads, downloads)
      }
    })

    test('should have data for all the dates', () => {
      const startDate = new Date('2021-04-05')
      const endDate = new Date()
      endDate.setDate(endDate.getDate() - 1)
      endDate.setUTCHours(0, 0, 0, 0)

      const oneDay = 24 * 60 * 60 * 1000
      const expectedDays = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)) + 1

      assert.equal(data.length, expectedDays)
      assert.equal(data[0][0], '2021-04-05')
      assert.equal(data[data.length - 1][0], endDate.toISOString().split('T')[0])
    })
  })
})
