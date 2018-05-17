const ecr = require('../extend/ecr')

const validateParams = params => {
  if (typeof params.repositories === 'string') {
    params.repositories = [params.repositories]
  }

  return params
}

const copyRepository = ({ repositoryData, from, to }) =>
  ecr
    .pullImage({
      image: repositoryData.repositoryUri,
      ...from
    })
    .then(() =>
      ecr.describeRepositories({
        repositories: [repositoryData.repositoryName],
        ...to
      })
    )
    .then(newRepositoryData => {
      if (Array.isArray(newRepositoryData) && newRepositoryData.length === 1) {
        return newRepositoryData[0]
      }

      return ecr.createRepository({
        repository: repositoryData.repositoryName,
        ...to
      })
    })
    .then(newRepositoryData =>
      ecr
        .tagImage({
          image: repositoryData.repositoryUri,
          newTag: newRepositoryData.repositoryUri
        })
        .then(() =>
          ecr.pushImage({ image: newRepositoryData.repositoryUri, ...to })
        )
        .then(() => newRepositoryData)
    )

module.exports = params => {
  const { repositories, from, to } = validateParams(params)

  return ecr
    .describeRepositories({ repositories, ...from })
    .then(repositoriesData =>
      Promise.all(
        repositoriesData.map(repositoryData =>
          copyRepository({ repositoryData, from, to })
        )
      )
    )
}
