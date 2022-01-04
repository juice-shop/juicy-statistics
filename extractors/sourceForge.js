/*
 * Copyright (c) 2021-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const fetch = require('node-fetch')
const url = 'https://sourceforge.net/projects/juice-shop/files/stats/json?'

const extractStats = async (startDate, endDate) => {
    let downloads
    const ExtractUrl = `${url}start_date=${startDate}&end_date=${endDate}`
    await fetch(ExtractUrl).then(
        (data) => data.json()
    ).then(
        (data) => {
            downloads = data.downloads
        }
    )

    return downloads
}

module.exports = extractStats