const docker = require('./docker')
const github = require('./github')


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