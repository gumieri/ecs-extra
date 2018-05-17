const { URL } = require('url')
const childProcess = require('child_process')

const exec = command =>
  new Promise((resolve, reject) => {
    const child = childProcess.exec(command, (err, stdout, stderr) => {
      if (err) return reject(err)

      return resolve(stdout.toString('utf8'))
    })

    child.stdout.pipe(process.stdout)

    child.stderr.pipe(process.stderr)

    process.setMaxListeners(20)
    process.on('exit', () => child.kill())
    child.on('exit', () => process.removeListener('exit', () => child.kill()))
  })

const ecrSDK = ({ profile = 'default', region }) => {
  const AWS = require('aws-sdk')

  const credentials = new AWS.SharedIniFileCredentials({ profile })

  AWS.config.credentials = credentials

  if (region) AWS.config.update({ region })

  return new AWS.ECR({ apiVersion: '2015-09-21' })
}

const describeRepositories = params => {
  const ecr = ecrSDK(params)
  delete params.region
  delete params.profile

  return new Promise((resolve, reject) =>
    ecr.describeRepositories(
      { repositoryNames: params.repositories },
      (err, data) => {
        if (err) {
          if (err.code === 'RepositoryNotFoundException') return resolve([])

          return reject(err)
        }

        return resolve(data.repositories)
      }
    )
  )
}

const createRepository = params => {
  const ecr = ecrSDK(params)
  delete params.region
  delete params.profile

  return new Promise((resolve, reject) =>
    ecr.createRepository({ repositoryName: params.repository }, (err, data) => {
      if (err) return reject(err)

      return resolve(data.repository)
    })
  )
}

const login = params =>
  getAuthorizationData({ region: params.region, profile: params.profile }).then(
    ({ authorizationToken, proxyEndpoint }) => {
      const [username, password] = Buffer.from(authorizationToken, 'base64')
        .toString()
        .split(':')
      return exec(`docker login -u ${username} -p ${password} ${proxyEndpoint}`)
    }
  )

const getAuthorizationData = params => {
  const ecr = ecrSDK(params)
  delete params.region
  delete params.profile

  return new Promise((resolve, reject) =>
    ecr.getAuthorizationToken(params, (err, data) => {
      if (err) return reject(err)

      return resolve(data.authorizationData[0])
    })
  )
}

const tagImage = params =>
  login(params).then(() => exec(`docker tag ${params.image} ${params.newTag}`))

const pullImage = params =>
  login(params).then(() => exec(`docker pull ${params.image}`))

const pushImage = params =>
  login(params).then(() => exec(`docker push ${params.image}`))

module.exports = {
  tagImage,
  pullImage,
  pushImage,
  describeRepositories,
  createRepository,
  getAuthorizationData
}
