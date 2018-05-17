const ecs = require('../extend/ecs')
const repositories = require('../repositories')

const RepositoryNameRegex = /(?<=\/)[a-z\-]+/

const validateParams = params => {
  if (typeof params.taskDefinitions === 'string') {
    params.taskDefinitions = [params.taskDefinitions]
  }

  return params
}

const containerDefinitionWithNewRepository = ({
  containerDefinition,
  from,
  to
}) => {
  const [repositoryName] = containerDefinition.image.match(RepositoryNameRegex)

  return repositories
    .copy({ repositories: [repositoryName], from, to })
    .then(newRepositoriesData => {
      containerDefinition.image = newRepositoriesData[0].repositoryUri

      return containerDefinition
    })
}

const copyTaskDefinitionConfig = ({ taskDefinitionConfig, from, to }) => {
  if (to.region === from.region && to.profile === from.profile) {
    return taskDefinitionConfig
  }

  return Promise.all(
    taskDefinitionConfig.containerDefinitions.map(containerDefinition =>
      containerDefinitionWithNewRepository({
        containerDefinition,
        from,
        to
      })
    )
  )
    .then(containerDefinitions => ({
      ...taskDefinitionConfig,
      ...{ containerDefinitions }
    }))
    .then(taskDefinitionConfig =>
      ecs.registerTaskDefinition({
        ...taskDefinitionConfig,
        region: to.region,
        profile: to.profile
      })
    )
}

module.exports = params => {
  const { taskDefinitions, from, to } = validateParams(params)

  if (!taskDefinitions || taskDefinitions.length === 0) {
    return Promise.resolve()
  }

  return ecs
    .clustersExists({
      clusters: [to.cluster],
      region: to.region,
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
      Promise.all(
        taskDefinitions.map(taskDefinition =>
          ecs.describeTaskDefinition({
            taskDefinition,
            region: from.region,
            profile: from.profile
          })
        )
      )
    )
    .then(taskDefinitionsConfig =>
      Promise.all(
        taskDefinitionsConfig.map(taskDefinitionConfig =>
          copyTaskDefinitionConfig({ taskDefinitionConfig, from, to })
        )
      )
    )
}
