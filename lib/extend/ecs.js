const ecsSDK = ({ profile = 'default', region }) => {
  const AWS = require('aws-sdk')

  const credentials = new AWS.SharedIniFileCredentials({ profile })

  AWS.config.credentials = credentials

  if (region) AWS.config.update({ region })

  return new AWS.ECS({ apiVersion: '2014-11-13' })
}

const describeTaskDefinition = params => {
  const ecs = ecsSDK(params)
  delete params.region
  delete params.profile

  return new Promise((resolve, reject) =>
    ecs.describeTaskDefinition(params, (err, data) => {
      if (err) return reject(err)

      return resolve(data.taskDefinition)
    })
  )
}

const registerTaskDefinition = params => {
  const ecs = ecsSDK(params)
  delete params.region
  delete params.profile
  delete params.taskDefinitionArn
  delete params.revision
  delete params.status
  delete params.requiresAttributes
  delete params.compatibilities

  return new Promise((resolve, reject) =>
    ecs.registerTaskDefinition(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data.taskDefinition)
    })
  )
}

const deregisterTaskDefinition = params => {
  const ecs = ecsSDK(params)
  delete params.region
  delete params.profile

  return new Promise((resolve, reject) =>
    ecs.deregisterTaskDefinition(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data.taskDefinition)
    })
  )
}

const createService = params => {
  const ecs = ecsSDK(params)
  delete params.region
  delete params.profile

  return new Promise((resolve, reject) =>
    ecs.createService(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  )
}

const describeServices = params => {
  const ecs = ecsSDK(params)
  delete params.region
  delete params.profile

  return new Promise((resolve, reject) =>
    ecs.describeServices(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data.services)
    })
  )
}

const updateService = params => {
  const ecs = ecsSDK(params)
  delete params.region
  delete params.profile

  return new Promise((resolve, reject) =>
    ecs.updateService(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data.service)
    })
  )
}

const clustersExists = params => {
  return describeClusters(params).then(clustersFound => {
    if (clustersFound.length !== params.clusters.length) {
      throw new Error('One or more clusters not found')
    }

    return true
  })
}

const describeClusters = params => {
  const ecs = ecsSDK(params)
  delete params.region
  delete params.profile

  return new Promise((resolve, reject) =>
    ecs.describeClusters(params, (err, data) => {
      if (err) return reject(err)

      return resolve(data.clusters)
    })
  )
}

module.exports = {
  // TasksDefinition
  describeTaskDefinition,
  registerTaskDefinition,
  deregisterTaskDefinition,
  // Services
  createService,
  describeServices,
  updateService,
  // Clusters
  clustersExists,
  describeClusters
}
