/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'fs/promises'

const tagsUrl = 'https://hub.docker.com/v2/repositories/bkimminich/juice-shop/tags/?page_size=100'
const versionPattern = /^v\d+\.\d+\.\d+$/

interface DockerImage {
  architecture: string
  os: string
  size: number
}

interface DockerTag {
  name: string
  images: DockerImage[]
}

interface DockerTagsResponse {
  next: string | null
  results: DockerTag[]
}

interface ImageSizeEntry {
  tag: string
  size: number
}

function compareSemver (a: string, b: string): number {
  const pa = a.replace(/^v/, '').split('.').map(Number)
  const pb = b.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  return 0
}

const collectData = async (): Promise<void> => {
  const entries: ImageSizeEntry[] = []
  let url: string | null = tagsUrl

  while (url != null) {
    const response = await fetch(url)
    const data = await response.json() as DockerTagsResponse

    for (const tag of data.results) {
      if (!versionPattern.test(tag.name) && tag.name !== 'snapshot') continue
      if (tag.images.length === 0) continue

      const amd64 = tag.images.find(img => img.architecture === 'amd64')
      if (amd64 != null) {
        entries.push({ tag: tag.name, size: amd64.size })
      } else {
        const sorted = [...tag.images].sort((a, b) => a.architecture.localeCompare(b.architecture))
        entries.push({ tag: tag.name, size: sorted[0].size })
      }
    }

    url = data.next
  }

  const snapshot = entries.filter(e => e.tag === 'snapshot')
  const versioned = entries.filter(e => e.tag !== 'snapshot')
  versioned.sort((a, b) => compareSemver(a.tag, b.tag))
  await fs.writeFile('statsData/dockerImageSizes.json', JSON.stringify([...versioned, ...snapshot]))
}

const fetchData = async (): Promise<ImageSizeEntry[]> => {
  const buffer = await fs.readFile('statsData/dockerImageSizes.json')
  return JSON.parse(buffer.toString()) as ImageSizeEntry[]
}

export { collectData, fetchData }
