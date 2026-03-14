/** Model API runner
  (
    models: Array<Model>
      The array of models to run the action on.
    name: string
      If any model has a function under under this key, that function will be run.
    api: Object<GatsbyAPI>
      The api object provided by Gatsby in whichever lifecycle method or Model this
      function is being called in.
    modelOptions
      This fourth positional parameter is meant to pass data through to the Models.
      If this isn't provided, it defaults to an object including all the models
      currently being run as an injected dependency: this allows for sharing
      Gatsby build code via models that call custom hooks on other models.
  )

  Standard usage:
    In a Gatsby API, this mimics the original Gatsby call on all Models:

    exports.onCreateNode = (api) =>
      callOnModels(models, "onCreateNode", api)

    You can also call this within another function if you want to use Models
    within a regular gatsby-node function.
*/

async function callOnModels(models, name, api, modelOptions = { models }) {
  return Promise.all(
    models.map(
      model =>
        typeof model[name] === 'function' && model[name](api, modelOptions)
    )
  )
}

export default callOnModels
