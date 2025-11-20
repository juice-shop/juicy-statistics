/*
 * Basic unit tests for extractors/github.fetchData
 * Uses Node's native test runner (node:test) and builtin assertions.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

// Import from project source
import { fetchData } from '../extractors/github'

test('github.fetchData returns a matrix with header row and consistent lengths', () => {
  const { data, releases } = fetchData()

  // Should have at least header + 1 data row
  assert.ok(Array.isArray(data), 'data should be an array')
  assert.ok(data.length >= 1, 'data should have at least a header row')

  // Header row should contain the expected release labels
  const header = data[0]
  assert.ok(Array.isArray(header), 'header should be an array')
  assert.equal(header.length, releases, 'header length should equal releases count')

  // Known releases per source file (keep this in sync if source changes)
  const expectedReleases = ['v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v18', 'v19']
  assert.deepEqual(header, expectedReleases, 'header should list expected releases')

  // Every data row should include date + one column per release
  for (let i = 1; i < data.length; i++) {
    const row = data[i]
    assert.ok(Array.isArray(row), `row ${i} should be an array`)
    assert.equal(
      row.length,
      1 + releases,
      `row ${i} should have 1 date column + ${releases} release columns`
    )
    // Validate the date format (YYYY-MM-DD)
    const date = row[0]
    assert.equal(typeof date, 'string', 'date column should be a string')
    assert.match(date, /^\d{4}-\d{2}-\d{2}$/)
  }
})
