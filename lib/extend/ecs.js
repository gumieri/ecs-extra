const ecsConfig = { apiVersion: '2014-11-13' }

const describeTaskDefinition = params => {
  const AWS = require('aws-sdk')
  const ecs = new AWS.ECS(ecsConfig)

  return new Promise((resolve, reject) =>
    ecs.describeTaskDefinition(params, (err, data) => {
      if (err) return reject(err)

      return resolve(data.taskDefinition)
    })
  )
}

const registerTaskDefinition = params => {
  const AWS = require('aws-sdk')
  const ecs = new AWS.ECS(ecsConfig)

  return new Promise((resolve, reject) =>
    ecs.registerTaskDefinition(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data.taskDefinition)
    })
  )
}

const deregisterTaskDefinition = params => {
  const AWS = require('aws-sdk')
  const ecs = new AWS.ECS(ecsConfig)

  return new Promise((resolve, reject) =>
    ecs.deregisterTaskDefinition(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data.taskDefinition)
    })
  )
}

const createService = params => {
  const AWS = require('aws-sdk')
  const ecs = new AWS.ECS(ecsConfig)

  return new Promise((resolve, reject) =>
    ecs.createService(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  )
}

const describeServices = params => {
  const AWS = require('aws-sdk')
  const ecs = new AWS.ECS(ecsConfig)

  return new Promise((resolve, reject) =>
    ecs.describeServices(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data.services)
    })
  )
}

const updateService = params => {
  const AWS = require('aws-sdk')
  const ecs = new AWS.ECS(ecsConfig)

  return new Promise((resolve, reject) =>
    ecs.updateService(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data.service)
    })
  )
}

const clustersExists = ({ clusters }) => {
  if (typeof clusters === 'string') clusters = [clusters]

  return describeClusters({ clusters }).then(clustersFound => {
    if (clustersFound.length !== clusters.length) {
      throw new Error('One or more clusters not found')
    }

    return true
  })
}

const describeClusters = params => {
  const AWS = require('aws-sdk')
  const ecs = new AWS.ECS(ecsConfig)

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
