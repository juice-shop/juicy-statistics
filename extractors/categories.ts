/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import yaml from 'js-yaml'

const getData = async (): Promise<{ categories: Array<[string, number]>, tags: Array<[string, number]> }> => {
  const url = 'https://raw.githubusercontent.com/OWASP/www-project-juice-shop/master/_data/challenges.yml'
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data = await response.text()
  const doc = yaml.load(data) as any[]

  const chart: Record<string, number> = {}
  const tags: Record<string, number> = {}

  for (const record of doc) {
    if (chart[record.category] === undefined) {
      chart[record.category] = 1
    } else {
      chart[record.category] = chart[record.category] + 1
    }

    if (record.tags !== undefined) {
      for (const tag of record.tags) {
        if (tags[tag] === undefined) {
          tags[tag] = 1
        } else {
          tags[tag] = tags[tag] + 1
        }
      }
    }
  }

const categories = Object.entries(chart)
const tagData = Object.entries(tags)

  return {
    categories,
    tags: tagData
  }
}

export { getData }
