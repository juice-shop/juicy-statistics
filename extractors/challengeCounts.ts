/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs/promises'
import yaml from 'js-yaml'

const tagsUrl = 'https://api.github.com/repos/juice-shop/juice-shop/tags?per_page=100'
const rawBaseUrl = 'https://raw.githubusercontent.com/juice-shop/juice-shop/refs/tags'
const versionPattern = /^v\d+\.\d+\.\d+$/
const challengeCreatePattern = /Challenge\.create\(\{/g

interface ChallengeCountEntry {
  tag: string
  challenges: number
}

interface GitHubTag {
  name: string
}

function parseSemver (v: string): number[] {
  const parts = v.replace(/^v/, '').replace(/-.*$/, '').split('.').map(Number)
  while (parts.length < 3) parts.push(0)
  return parts
}

function compareSemver (a: string, b: string): number {
  const pa = parseSemver(a)
  const pb = parseSemver(b)
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  // Pre-release sorts before the release
  const aPre = a.includes('-')
  const bPre = b.includes('-')
  if (aPre && !bPre) return -1
  if (!aPre && bPre) return 1
  return 0
}

function getDisplayTag (tag: string): string {
  if (tag === 'v0.13.0') return 'v1.13.0'
  return tag
}

function getChallengeSource (displayTag: string): { file: string, method: 'yaml' | 'grep' } {
  if (compareSemver(displayTag, 'v7.0.0') >= 0) {
    return { file: 'data/static/challenges.yml', method: 'yaml' }
  }
  if (compareSemver(displayTag, 'v1.3.1') >= 0) {
    return { file: 'data/datacreator.js', method: 'grep' }
  }
  if (compareSemver(displayTag, 'v1.0.0') >= 0) {
    return { file: 'lib/datacreator.js', method: 'grep' }
  }
  return { file: 'server.js', method: 'grep' }
}

function countChallengesInSource (content: string, method: 'yaml' | 'grep'): number {
  if (method === 'yaml') {
    const doc = yaml.load(content) as any[]
    return doc.length
  }
  const matches = content.match(challengeCreatePattern)
  return matches != null ? matches.length : 0
}

const collectData = async (): Promise<void> => {
  const tags: Array<{ original: string, display: string }> = []
  let page = 1

  while (true) {
    const response = await fetch(`${tagsUrl}&page=${page}`)
    const data = await response.json() as GitHubTag[]
    if (data.length === 0) break

    for (const tag of data) {
      if (versionPattern.test(tag.name) || tag.name === 'v0.1-pre') {
        tags.push({ original: tag.name, display: getDisplayTag(tag.name) })
      }
    }
    page++
  }

  const entries: ChallengeCountEntry[] = []

  for (const tag of tags) {
    try {
      const source = getChallengeSource(tag.display)
      const url = `${rawBaseUrl}/${tag.original}/${source.file}`
      const response = await fetch(url)
      if (!response.ok) {
        console.warn(`Failed to fetch ${url}: ${response.status}`)
        continue
      }
      const content = await response.text()
      const count = countChallengesInSource(content, source.method)
      entries.push({ tag: tag.display, challenges: count })
    } catch (error) {
      console.warn(`Error processing tag ${tag.original}:`, error)
    }
  }

  entries.sort((a, b) => compareSemver(a.tag, b.tag))
  await fs.writeFile('statsData/challengeCounts.json', JSON.stringify(entries))
}

const fetchData = async (): Promise<ChallengeCountEntry[]> => {
  const buffer = await fs.readFile('statsData/challengeCounts.json')
  return JSON.parse(buffer.toString()) as ChallengeCountEntry[]
}

export { collectData, fetchData }
