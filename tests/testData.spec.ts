/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @typescript-eslint/no-floating-promises */

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { collectData, getStats } from '../extractors/npm'

describe('test correctness of the data', () => {
  describe('for npm', () => {
    test('should match with the data on server', async (t) => {
      await collectData() // <-- This line added to get coverage + updated data
      const data = getStats()
      const recentData = data.slice(-30)

      for (const [date, downloads] of recentData) {
        const response = await fetch(`https://api.npmjs.org/downloads/point/${date}:${date}/juice-shop-ctf-cli`)
        const npmData = await response.json()
        console.log(`Date: ${date}, Expected: ${downloads}, Actual: ${npmData.downloads}`)
        assert.equal(npmData.downloads, downloads)
      }
    })

    test('should have data for all the dates', () => {
      const data = getStats()
      const startDate = new Date('2021-04-05')
      const endDate = new Date()
      endDate.setDate(endDate.getDate() - 1)
      endDate.setUTCHours(0, 0, 0, 0)

      const oneDay = 24 * 60 * 60 * 1000
      const expectedDays = Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)) + 1

      const actualLastDate = data[data.length - 1][0]
      const expectedLastDate = endDate.toISOString().split('T')[0]
      const oneDayBefore = new Date(endDate.getTime() - 86400000).toISOString().split('T')[0]

      assert.ok(data.length === expectedDays || data.length === expectedDays - 1)
      assert.ok(data[0][0], '2021-04-05')
      assert.ok(actualLastDate === expectedLastDate || actualLastDate === oneDayBefore)
    })
  })
})
