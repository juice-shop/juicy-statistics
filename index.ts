/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import express from 'express'
import path from 'path'
import * as categories from './extractors/categories'
import * as docker from './extractors/docker'
import * as github from './extractors/github'
import * as statsNpm from './extractors/npm'
import * as statsSf from './extractors/sourceForge'
import * as spamReport from './extractors/spam-report'

import { env } from 'process'

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  const startDate = new Date(Date.now())
  startDate.setDate(startDate.getDate() - 90)
  const startDateStr = startDate.toISOString().split('T')[0]

  const endDate = new Date(Date.now())
  const endDateStr = endDate.toISOString().split('T')[0]

  let sourceForge: Array<[string, number]> = []
  sourceForge = await statsSf.extractStats(startDateStr, endDateStr)

  const sourceForgeCsv = sourceForge.flat().join(',')

  const catData = await categories.getData()
  const categoriesCsv = catData.categories.flat().join(',')
  const tagsCsv = catData.tags.flat().join(',')

  interface Category {
    id: number
    name: string
    description?: string
    [key: string]: any
  }

  interface CategoriesData {
    categories: Category[]
    tags: string[]
  }

  const categoriesData: CategoriesData = { categories: [], tags: [] }

  await categories.getData().then((data: any) => {
    categoriesData.categories = data.categories.map(
      (entry: Array<string | number>) => ({
        id: Number(entry[0]),
        name: String(entry[1]),
        description:
          entry[2] !== null && entry[2] !== undefined
            ? String(entry[2])
            : undefined
      })
    )

  })

  const npm = statsNpm.getStats()
  const dockerData = docker.fetchData()
  const githubData = github.fetchData()
  const spamData = await spamReport.fetchData()

  res.render('index.ejs', {
    sourceForge: sourceForgeCsv,
    npm,
    dockerJs: dockerData.jsData,
    dockerJsCtf: dockerData.jsCtfData,
    github: githubData.data,
    githubReleases: githubData.releases,
    tags: tagsCsv,
    categories: categoriesCsv,
    spamStats: spamData
  })
})

const port = env.PORT ?? 3000
app.listen(port)
