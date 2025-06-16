/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs'
import path from 'path'

const LABEL = 'spam'
const GITHUB_API_URL = 'https://api.github.com/repos/juice-shop/juice-shop/issues'
const HISTORY_FILE = path.join(
  __dirname,
  '..',
  'statsData',
  'spam-report.json'
)

const getDateString = (date: Date): string => date.toISOString().split('T')[0]

interface SpamItem {
  closed_at: string
  pull_request?: object | null
}

interface CollectDataResult {
  date: string
  totalSpamPRs: number
  totalSpamIssues: number
}

const collectData = async (date: Date): Promise<CollectDataResult> => {
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

  while (true) {
    const response: Response = await fetch(
      `${GITHUB_API_URL}?labels=${LABEL}&state=closed&since=${startDate.toISOString()}&until=${endDate.toISOString()}&per_page=100&page=${page}`,
      { headers }
    )

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

  return {
    date: getDateString(startDate),
    totalSpamPRs: spamPRs.length,
    totalSpamIssues: spamIssues.length
  }
}

const fetchData = async (): Promise<CollectDataResult[]> => {
  const fileContent = fs.readFileSync(HISTORY_FILE, 'utf-8')

  const today = new Date()
  const todayString = getDateString(today)

  interface HistoryEntry {
    date: string
    totalSpamPRs: number
    totalSpamIssues: number
  }

  const history: HistoryEntry[] = JSON.parse(fileContent)

  if (history.some((entry: HistoryEntry) => entry.date === todayString)) {
    console.log(`Data for ${todayString} already exists. Skipping.`)
    return history
  }

  const dailyData = await collectData(today)
  if (dailyData !== null && dailyData !== undefined) {
    history.push(dailyData)
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2))
    console.log(`✅ Added data for ${todayString}`)
  }

  return history
}

export {
  collectData,
  fetchData
}
