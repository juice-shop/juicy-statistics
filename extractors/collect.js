/*
 * Copyright (c) 2021-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const docker = require('./docker')
const github = require('./github')
const npm = require('./npm')


docker.collect().then(
    () => {
        console.log(`Sucessfully collected docker stats for ${Date(Date.now())}`)
    }
)
github.collect().then(
    () => {
        console.log(`Sucessfully collected github stats for ${Date(Date.now())}`)
    }
)
npm.collectData().then(
    () => {
        console.log(`Sucessfully collected npm stats for ${Date(Date.now())}`)
    }
)