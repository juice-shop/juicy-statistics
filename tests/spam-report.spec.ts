/*
 * Unit tests for extractors/spam-report.fetchData
 * Uses Node's native test runner (node:test) and builtin assertions.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

// @ts-nocheck
import { fetchData } from '../extractors/spam-report'

test('spam-report.fetchData returns array of daily records with expected fields', async () => {
  const data = await fetchData()

  assert.ok(Array.isArray(data), 'result should be an array')
  assert.ok(data.length > 0, 'history should not be empty')

  // Validate structure of a few entries
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const entry = data[i]
    assert.equal(typeof entry.date, 'string', 'date should be a string')
    assert.match(entry.date, /^\d{4}-\d{2}-\d{2}$/)

    assert.equal(typeof entry.totalSpamPRs, 'number', 'totalSpamPRs should be a number')
    assert.equal(typeof entry.totalSpamIssues, 'number', 'totalSpamIssues should be a number')
    assert.ok(entry.totalSpamPRs >= 0, 'totalSpamPRs should be non-negative')
    assert.ok(entry.totalSpamIssues >= 0, 'totalSpamIssues should be non-negative')
  }

  // Ensure dates are monotonically non-decreasing
  for (let i = 1; i < data.length; i++) {
    const prevEntry = data[i - 1]
    const currEntry = data[i]
    // @ts-ignore - runtime check only
    const prev = new Date(prevEntry.date)
    // @ts-ignore - runtime check only
    const curr = new Date(currEntry.date)
    assert.ok(prev <= curr, `dates should be non-decreasing at index ${i}`)
  }
})
