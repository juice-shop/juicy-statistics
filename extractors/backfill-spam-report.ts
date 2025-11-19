/*
 * Copyright (c) 2021-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs'
import path from 'path'

// One-time backfill script for spam-report.json
// Fills the gap from 2025-03-19 up to yesterday (inclusive),
// skipping any dates that already exist in the file (idempotent).

const LABEL = 'spam'
const GITHUB_API_URL = 'https://api.github.com/repos/juice-shop/juice-shop/issues'
const HISTORY_FILE = path.join('statsData', 'spam-report.json')

const getDateString = (date: Date) => date.toISOString().split('T')[0]

interface SpamItem {
  closed_at: string
  pull_request?: object | null
}

interface CollectDataResult {
  date: string
  totalSpamPRs: number
  totalSpamIssues: number
}

const collectForDate = async (date: Date) => {
  const startDate = new Date(date)
  startDate.setUTCHours(0, 0, 0, 0)
  const endDate = new Date(date)
  endDate.setUTCHours(23, 59, 59, 999)

  const spamIssues: SpamItem[] = []
  const spamPRs: SpamItem[] = []
  let page = 1

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json'
  }

  const token = process.env.GITHUB_TOKEN
  if (token && token.trim().length > 0) {
    headers.Authorization = `Bearer ${token}`
  }

  while (true) {
      console.log(`${GITHUB_API_URL}?labels=${LABEL}&state=closed&since=${startDate.toISOString()}&until=${endDate.toISOString()}&per_page=100&page=${page}`)
    const response = await fetch(
      `${GITHUB_API_URL}?labels=${LABEL}&state=closed&since=${startDate.toISOString()}&until=${endDate.toISOString()}&per_page=100&page=${page}`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`GitHub API error (${response.status}): ${await response.text()}`)
    }

    const data: SpamItem[] = await response.json()
    if (!Array.isArray(data) || data.length === 0) break

    data.forEach((item: SpamItem) => {
      const closedDate = new Date(item.closed_at)
      if (closedDate >= startDate && closedDate <= endDate) {
        if (item.pull_request !== undefined && item.pull_request !== null) {
          spamPRs.push(item)
        } else {
          spamIssues.push(item)
        }
      }
    })

    page++
  }

  const result: CollectDataResult = {
    date: getDateString(startDate),
    totalSpamPRs: spamPRs.length,
    totalSpamIssues: spamIssues.length
  }
  return result
}

const readHistory = () => {
  const raw = fs.readFileSync(HISTORY_FILE, 'utf-8')
  return JSON.parse(raw) as CollectDataResult[]
}

const writeHistory = (history: CollectDataResult[]) => {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2))
}

const getYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

const main = async () => {
  console.log('Starting spam-report backfill...')
  const history = readHistory()

  // Determine start date: fixed per requirement (2025-03-19)
  const start = new Date(Date.UTC(2025, 2, 19)) // Months are 0-based; 2 = March
  const end = getYesterday()

  if (start > end) {
    console.log('Nothing to backfill: start date is after yesterday.')
    return
  }

  // Build a Set of existing dates for idempotency
  const existing = new Set(history.map((h) => h.date))

  let processed = 0
  let skipped = 0

  const cursor = new Date(start)
  while (cursor <= end) {
    const dateStr = getDateString(cursor)
    if (existing.has(dateStr)) {
      skipped++
    } else {
      try {
        const daily = await collectForDate(cursor)
        history.push(daily)
        existing.add(dateStr)
        processed++
        console.log(`Added ${dateStr}: issues=${daily.totalSpamIssues}, prs=${daily.totalSpamPRs}`)
      } catch (err) {
        console.error(`Failed to collect for ${dateStr}:`, err)
        // Best-effort: proceed to next day
      }
    }
    // Advance by one day (UTC)
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  // Keep chronological order
  history.sort((a: CollectDataResult, b: CollectDataResult) => a.date.localeCompare(b.date))
  writeHistory(history)

  console.log(`Backfill complete. Added ${processed} day(s), skipped ${skipped} already present.`)
}

// Execute when called directly
void main()

export {}
