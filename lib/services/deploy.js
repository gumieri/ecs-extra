const ecs = require('../extend/ecs')

const TaskDefinitionRegex = /(?<=task-definition\/).*(?=:[0-9]+$)/

module.exports = ({ cluster, service, image }) =>
  ecs
    .clustersExists({ clusters: [cluster] })
    .then(() => ecs.describeServices({ cluster, services: [service] }))
    .then(servicesFound => {
      if (servicesFound.length === 0) {
        throw new Error('Service not found')
      }

      const taskDefinitionArn = servicesFound[0].taskDefinition
      const taskDefinition = taskDefinitionArn.match(TaskDefinitionRegex)[0]

      return ecs
        .describeTaskDefinition({ taskDefinition: taskDefinitionArn })
        .then(taskDefinitionConfig => {
          delete taskDefinitionConfig.taskDefinitionArn
          delete taskDefinitionConfig.revision
          delete taskDefinitionConfig.status
          delete taskDefinitionConfig.requiresAttributes
          delete taskDefinitionConfig.compatibilities

          taskDefinitionConfig.containerDefinitions[0].image = image

          return ecs
            .registerTaskDefinition(taskDefinitionConfig)
            .then(() =>
              ecs.deregisterTaskDefinition({
                taskDefinition: taskDefinitionArn
              })
            )
            .then(() => ecs.updateService({ cluster, service, taskDefinition }))
        })
    })
