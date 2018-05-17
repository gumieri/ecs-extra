const ecs = require('../extend/ecs')

const TaskDefinitionRegex = /(?<=task-definition\/).*(?=:[0-9]+$)/

module.exports = async (service, { cluster, image }) => {
  await ecs.clustersExists({ clusters: [cluster] })

  const servicesFound = await ecs.describeServices({
    cluster,
    services: [service]
  })

  if (servicesFound.length === 0) throw new Error('Service not found')

  const taskDefinitionArn = servicesFound[0].taskDefinition
  const taskDefinition = taskDefinitionArn.match(TaskDefinitionRegex)[0]

  taskDefinitionConfig = await ecs.describeTaskDefinition({
    taskDefinition: taskDefinitionArn
  })

  taskDefinitionConfig.containerDefinitions[0].image = image

  await ecs.registerTaskDefinition(taskDefinitionConfig)
  await ecs.deregisterTaskDefinition({ taskDefinition: taskDefinitionArn })
  await ecs.updateService({ cluster, service, taskDefinition })
}
