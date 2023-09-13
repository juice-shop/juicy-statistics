/*
 * Copyright (c) 2021-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const express = require('express')
const path = require('path')
const statsSf = require('./extractors/sourceForge')
const statsNpm = require('./extractors/npm')
const docker = require('./extractors/docker')
const github = require('./extractors/github')
const categories = require('./extractors/categories')
const { env } = require('process')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', async (req, res) => {
  let startDate = new Date(Date.now())
  startDate.setDate(startDate.getDate() - 90)
  startDate = `${startDate.toISOString().split('T')[0]}`
  let endDate = new Date(Date.now())
  endDate = `${endDate.toISOString().split('T')[0]}`

  let sourceForge
  await statsSf(startDate, endDate).then(
    (data) => {
      sourceForge = data
    }
  )
  let categoriesData
  let tags
  await categories.getData().then(
    (data) => {
      categoriesData = data.categories
      tags = data.tags
    }
  )
  const npm = statsNpm.getStats()
  const dockerData = docker.fetchData()
  const githubData = github.fetchData()

  res.render('index.ejs', {
    sourceForge,
    npm,
    dockerJs: dockerData.jsData,
    dockerJsCtf: dockerData.jsCtfData,
    github: githubData.data,
    githubReleases: githubData.releases,
    tags,
    categories: categoriesData
  })
})

app.listen(env.PORT || 3000)
