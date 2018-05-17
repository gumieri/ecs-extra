const ecs = require('../extend/ecs')
const taskDefinitions = require('../task_definitions')

const validateParams = params => {
  if (typeof params.services === 'string') {
    params.services = [params.services]
  }

  return params
}
module.exports = params => {
  const { services, from, to } = validateParams(params)

  if (!services || services.length === 0) {
    return Promise.resolve()
  }

  return ecs
    .clustersExists({
      region: to.region,
      clusters: [to.cluster],
      profile: to.profile
    })
    .then(() =>
      ecs.clustersExists({
        region: from.region,
        clusters: [from.cluster],
        profile: from.profile
      })
    )
    .then(() =>
      ecs.describeServices({
        region: from.region,
        cluster: from.cluster,
        profile: from.profile,
        services
      })
    )
    .then(oldServices =>
      oldServices.map(service => ({
        region: to.region,
        profile: to.profile,
        cluster: to.cluster,
        desiredCount: service.desiredCount,
        loadBalancers: service.loadBalancers,
        serviceName: service.serviceName,
        taskDefinition: service.taskDefinition
      }))
    )
    .then(newServices =>
      Promise.all(newServices.map(newService => ecs.createService(newService)))
    )
}
