/*
 * Copyright (c) 2021-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const url = 'https://sourceforge.net/projects/juice-shop/files/stats/json?'

const extractStats = async (startDate: string, endDate: string): Promise<Array<[string, number]>> => {
  const ExtractUrl = `${url}start_date=${startDate}&end_date=${endDate}`
  const response = await fetch(ExtractUrl)
  const data = await response.json()
  // Defensive: if downloads is not an array, return empty array
  if (!Array.isArray(data.downloads)) {
    return []
  }
  return data.downloads as Array<[string, number]>
}

export { extractStats }
