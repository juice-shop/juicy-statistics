/*
 * Copyright (c) 2021-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const { response } = require('express')
const yaml = require('js-yaml')
const fetch = require('node-fetch')

const getData = async () => {
    let url = 'https://raw.githubusercontent.com/OWASP/www-project-juice-shop/master/_data/challenges.yml'
    let data
    await fetch(url,{
        headers:{
            'Content-Type':'application/json'
        }
    }).then(
        response => response.text()
    ).then(
        (buffer) => {
            data = buffer
        }
    )

    const doc = yaml.load(data,'utf-8')
    let chart = {}
    let tags = {}

    for(const record of doc){
        if(chart[record.category] === undefined){
            chart[record.category] = 1
        }
        else{
            chart[record.category] = chart[record.category] + 1
        }

        if(record.tags !== undefined){
            for(const tag of record.tags){
                if(tags[tag] === undefined){
                    tags[tag] = 1
                }
                else{
                    tags[tag] = tags[tag] + 1
                }
            }
        }

    }

    const tagNames = Object.getOwnPropertyNames(tags)
    const tagData = []
    for(const tag of tagNames){
        tagData.push([tag,tags[tag]])

    }
    const categories = Object.getOwnPropertyNames(chart)
    const format = []
    for(const category of categories){
        format.push([category,chart[category]])
    }

    return {
        categories: format,
        tags: tagData
    }
}

module.exports.getData = getData