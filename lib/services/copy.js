const ecs = require('../extend/ecs')

module.exports = ({ services, toCluster, fromCluster }) => {
  if (typeof services === 'string') services = [services]

  if (!services || services.length === 0) {
    return Promise.resolve()
  }

  return ecs
    .clustersExists({ clusters: [toCluster, fromCluster] })
    .then(() => ecs.describeServices({ cluster: fromCluster, services }))
    .then(services => {
      const promises = services.map(service =>
        ecs.createService({
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
