/*
 * Basic unit tests for extractors/docker.fetchData
 * Uses Node's native test runner (node:test) and builtin assertions.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

// Import from project source
import { fetchData } from '../extractors/docker'

test('docker.fetchData returns valid arrays for jsData, jsCtfData, and multiJuicerData', () => { // eslint-disable-line @typescript-eslint/no-floating-promises
  const { jsData, jsCtfData, multiJuicerData } = fetchData()

  assert.ok(Array.isArray(jsData), 'jsData should be an array')
  assert.ok(Array.isArray(jsCtfData), 'jsCtfData should be an array')
  assert.ok(Array.isArray(multiJuicerData), 'multiJuicerData should be an array')

  assert.equal(jsData.length, multiJuicerData.length, 'jsData and multiJuicerData should have matching length')
  assert.equal(jsCtfData.length, multiJuicerData.length, 'jsCtfData and multiJuicerData should have matching length')

  for (let i = 0; i < multiJuicerData.length; i++) {
    const row = multiJuicerData[i]
    assert.ok(Array.isArray(row), `row ${i} should be an array`)
    assert.equal(row.length, 2, `row ${i} should have 2 elements [date, downloads]`)
    assert.equal(typeof row[0], 'string', 'date should be a string')
    assert.match(row[0], /^\d{4}-\d{2}-\d{2}$/, 'date should match YYYY-MM-DD')
    assert.equal(typeof row[1], 'number', 'downloads should be a number')
    assert.ok(!isNaN(row[1]), 'downloads should not be NaN')
  }
})
