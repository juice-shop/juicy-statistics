/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs'
import path from 'path'

const LABEL = 'spam'
const GITHUB_API_URL = 'https://api.github.com/repos/juice-shop/juice-shop/issues'
const HISTORY_FILE = path.join('statsData', 'spam-report.json')

interface CollectDataResult {
  date: string
  totalSpamPRs: number
  totalSpamIssues: number
}

interface GitHubIssue {
  closed_at: string | null
  pull_request?: object
}

const collectAllSpamData = async (): Promise<CollectDataResult[]> => {
  const allItems: GitHubIssue[] = []
  let page = 1
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json'
  }

  if (process.env.GITHUB_TOKEN !== undefined) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`
  }

  while (true) {
    const response: Response = await fetch(
      `${GITHUB_API_URL}?labels=${LABEL}&state=closed&per_page=100&page=${page}`,
      { headers }
    )

    const rateLimitRemaining = response.headers.get('x-ratelimit-remaining')
    const rateLimitReset = response.headers.get('x-ratelimit-reset')

    if (rateLimitRemaining !== null && parseInt(rateLimitRemaining) < 10) {
      const resetTime = rateLimitReset !== null ? parseInt(rateLimitReset) * 1000 : Date.now() + 60000
      const waitTime = Math.max(resetTime - Date.now(), 0) + 1000
      console.log(`⏳ Rate limit approaching (${rateLimitRemaining} remaining). Waiting ${Math.ceil(waitTime / 1000)}s...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    const data: GitHubIssue[] = await response.json()
    if (!Array.isArray(data) || data.length === 0) break

    allItems.push(...data)
    console.log(`📥 Fetched page ${page} (${allItems.length} items total)`)
    page++
  }

  const pullRequests = allItems.filter(item => item.pull_request !== undefined)
  const issues = allItems.filter(item => item.pull_request === undefined)

  const prsByDate = pullRequests.reduce<Record<string, number>>((acc, pr) => {
    if (pr.closed_at !== null) {
      const date = pr.closed_at.split('T')[0]
      acc[date] = (acc[date] ?? 0) + 1
    }
    return acc
  }, {})

  const issuesByDate = issues.reduce<Record<string, number>>((acc, issue) => {
    if (issue.closed_at !== null) {
      const date = issue.closed_at.split('T')[0]
      acc[date] = (acc[date] ?? 0) + 1
    }
    return acc
  }, {})

  const allDates = new Set([...Object.keys(prsByDate), ...Object.keys(issuesByDate)])

  return Array.from(allDates).sort().map(date => ({
    date,
    totalSpamPRs: prsByDate[date] ?? 0,
    totalSpamIssues: issuesByDate[date] ?? 0
  }))
}

const collectData = async (): Promise<void> => {
  const allData = await collectAllSpamData()
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(allData, null, 2))
  console.log(`✅ Updated spam report with ${allData.length} dates`)
}

const fetchData = async (): Promise<CollectDataResult[]> => {
  const fileContent = fs.readFileSync(HISTORY_FILE, 'utf-8')
  return JSON.parse(fileContent)
}

if (require.main === module) {
  collectData().then(
    () => {
      console.log(`Successfully collected spam-report stats for ${new Date().toString()}`)
      process.exit(0)
    }
  ).catch((error) => {
    console.log('Failed to collect spam-report stats', error)
    process.exit(1)
  })
}

export {
  collectData,
  fetchData
}
