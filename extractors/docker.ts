/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs'

const urlMultiJuicer = 'https://github.com/juice-shop/multi-juicer/pkgs/container/multi-juicer%2Fmulti-juicer'

const urlJs = 'https://registry.hub.docker.com/v2/repositories/bkimminich/juice-shop/'
const urlJsCtf = 'https://registry.hub.docker.com/v2/repositories/bkimminich/juice-shop-ctf/'

const collectData = async (): Promise<void> => {
  const dockerDataMultiJuicerBuffer = fs.readFileSync('statsData/dockerMultiJuicer.json')
  const dockerDataMultiJuicerStr = dockerDataMultiJuicerBuffer.toString()
  const dockerDataMultiJuicer = JSON.parse(dockerDataMultiJuicerStr) as Record<string, [number, number]>
  const dockerDataJsBuffer = fs.readFileSync('statsData/dockerJs.json')
  const dockerDataJsStr = dockerDataJsBuffer.toString()
  const dockerDataJs = JSON.parse(dockerDataJsStr) as Record<string, [number, number]>
  const dockerDataJsCtfBuffer = fs.readFileSync('statsData/dockerJsCtf.json')
  const dockerDataJsCtfStr = dockerDataJsCtfBuffer.toString()
  const dockerDataJsCtf = JSON.parse(dockerDataJsCtfStr) as Record<string, [number, number]>
  const date = new Date(Date.now()).toISOString().split('T')[0]
  const prevDate = new Date(Date.now())
  prevDate.setDate(prevDate.getDate() - 1)
  const prevDateStr = prevDate.toISOString().split('T')[0]

  const prevJsData = dockerDataJs[prevDateStr] ?? null
  const prevMultiJuicerData = dockerDataMultiJuicer[prevDateStr] ?? null
  const prevJsCtfData = dockerDataJsCtf[prevDateStr] ?? null

  interface DockerRepoData { pull_count: number }
  let dataJs: DockerRepoData | undefined
  await fetch(urlJs).then(
    async (data) => await data.json()
  ).then(
    (data: DockerRepoData) => {
      dataJs = data
    }
  )

  let dataJsCtf: DockerRepoData | undefined
  await fetch(urlJsCtf).then(
    async (data) => await data.json()
  ).then(
    (data: DockerRepoData) => {
      dataJsCtf = data
    }
  )

  let dataMultiJuicer: number | undefined

  await fetch(urlMultiJuicer).then(
    async (data) => await data.text()
  ).then(
    (data: string) => {
      const match = data.match(/>Total downloads<\/span>\s*<h3 title="([\d,]+)">/i)

      if (match != null) {
        dataMultiJuicer = Number(match[1].replace(/,/g, ''))
      }
    }
  )

  if (dataJs != null && typeof dataJs.pull_count === 'number') {
    const prevCount = Array.isArray(prevJsData) && typeof prevJsData[1] === 'number'
      ? prevJsData[1]
      : 0
    dockerDataJs[date] = [dataJs.pull_count - prevCount, dataJs.pull_count]
  }

  if (dataJsCtf != null && typeof dataJsCtf.pull_count === 'number') {
    const prevCountCtf =
    Array.isArray(prevJsCtfData) && typeof prevJsCtfData[1] === 'number'
      ? prevJsCtfData[1]
      : 0
    dockerDataJsCtf[date] = [dataJsCtf.pull_count - prevCountCtf, dataJsCtf.pull_count]
  }

  if (typeof dataMultiJuicer === 'number') {
    const prevCount = Array.isArray(prevMultiJuicerData) && typeof prevMultiJuicerData[1] === 'number'
      ? prevMultiJuicerData[1]
      : 0

    dockerDataMultiJuicer[date] = [
      dataMultiJuicer - prevCount,
      dataMultiJuicer
    ]
  }

  fs.writeFileSync('statsData/dockerJs.json', JSON.stringify(dockerDataJs))

  fs.writeFileSync('statsData/dockerJsCtf.json', JSON.stringify(dockerDataJsCtf))

  fs.writeFileSync(
    'statsData/dockerMultiJuicer.json',
    JSON.stringify(dockerDataMultiJuicer)
  )
}

const fetchData = (): {
  jsData: Array<[string, number]>
  jsCtfData: Array<[string, number]>
  multiJuicerData: Array<[string, number]>
} => {
  const dockerDataJsBuffer = fs.readFileSync('statsData/dockerJs.json')
  const dockerDataJsStr = dockerDataJsBuffer.toString()
  const dockerDataJs = JSON.parse(dockerDataJsStr)
  const dockerDataJsCtfBuffer = fs.readFileSync('statsData/dockerJsCtf.json')
  const dockerDataJsCtfStr = dockerDataJsCtfBuffer.toString()
  const dockerDataJsCtf = JSON.parse(dockerDataJsCtfStr)

  const dockerDataMultiJuicerBuffer = fs.readFileSync('statsData/dockerMultiJuicer.json')
  const dockerDataMultiJuicerStr = dockerDataMultiJuicerBuffer.toString()
  const dockerDataMultiJuicer = JSON.parse(dockerDataMultiJuicerStr)

  const datesJs = Object.getOwnPropertyNames(dockerDataJs)
  const datesJsCtf = Object.getOwnPropertyNames(dockerDataJsCtf)
  const dataMultiJuicer: Array<[string, number]> = []

  const dataJs: Array<[string, number]> = []
  const dataJsCtf: Array<[string, number]> = []

  for (const date of datesJs) {
    dataJs.push([date, Number(dockerDataJs[date][0])])
  }

  const datesMultiJuicer = Object.getOwnPropertyNames(dockerDataMultiJuicer)

  for (const date of datesMultiJuicer) {
    dataMultiJuicer.push([date, Number(dockerDataMultiJuicer[date][0])])
  }

  for (const date of datesJsCtf) {
    dataJsCtf.push([date, Number(dockerDataJsCtf[date][0])])
  }

  return {
    jsData: dataJs,
    jsCtfData: dataJsCtf,
    multiJuicerData: dataMultiJuicer
  }
}

export { collectData, fetchData }
