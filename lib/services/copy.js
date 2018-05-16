const AWS = require('aws-sdk')

const ecs = new AWS.ECS({ apiVersion: '2014-11-13' })

const createService = params =>
  new Promise((resolve, reject) =>
    ecs.createService(params, (err, data) => {
      if (err) return reject(err)
      return resolve(data)
    })
  )

const describeServices = params =>
  new Promise((resolve, reject) =>
    ecs.describeServices(params, (err, { services }) => {
      if (err) return reject(err)
      return resolve(services)
    })
  )

const describeClusters = params =>
  new Promise((resolve, reject) =>
    ecs.describeClusters(params, (err, { clusters }) => {
      if (err) return reject(err)

      return resolve(clusters)
    })
  )

module.exports = ({ services, toCluster, fromCluster }) => {
  if (typeof services === 'string') services = [services]

  if (!services || services.length === 0) {
    return Promise.reject(new Error('No service found'))
  }

  return describeClusters({ clusters: [toCluster, fromCluster] })
    .then(clusters => {
      if (clusters.length <= 1) throw new Error('Target cluster not found')

      return describeServices({ cluster: fromCluster, services })
    })
    .then(services => {
      const promises = services.map(service =>
        createService({
          cluster: toCluster.clusterName,
          desiredCount: service.desiredCount,
          loadBalancers: service.loadBalancers,
          serviceName: service.serviceName,
          taskDefinition: service.taskDefinition
        })
      )

      return Promise.all(promises)
    })
}
