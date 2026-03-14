import path from 'upath'

/** Source Path Resolver Builder
   This function makes Gatsby resolvers that connect a node to another node via
   frontmatter fields. Each relation is slightly different, but only slightly different.
   This builder exposes just enough functionality to get to any node tagged with
   a sourcePath field, even if it's added with `createNodeField`.

   {
     type: string
       This is the name of the node type your resolver will fetch.
     resolvePath: function?
       If provided, the path that will be resolved will be the return value of
       this function called with the field's original value.
       If not provided, the field is used as-is.
     makeFilter: function?
       If provided, the filter that will be used on the query that finds the
       foreign Node will be the result of this function called with the resolved
       source path.
       If not provided, a default filter for the Node's top level will be used.
   }
*/

function sourcePathResolver({
  type, // string
  resolvePath, // function?
  makeFilter // function?
}) {
  return async function resolveBySourcePath(source, args, context, info) {
    const fieldValue = context.defaultFieldResolver(source, args, context, info)

    // Bail out early with null if no value was provided
    if (!fieldValue) return null

    // Allow for callers to provide a function that modifies the field value into
    // the actual relative path of a file.
    const sourcePath = resolvePath ? resolvePath(fieldValue) : fieldValue

    // Allow for the filter to be overridden in case sourcePath is somewhere
    // else in the node
    const filter = makeFilter
      ? makeFilter(sourcePath)
      : {
          sourcePath: {
            eq: sourcePath
          }
        }

    return context.nodeModel.findOne({
      query: {
        filter
      },
      type
    })
  }
}

// Pre-made fields

const resolvePostAuthor = sourcePathResolver({
  type: 'Author',
  resolvePath: value => path.join('authors', value) + '.md'
})

export { sourcePathResolver, resolvePostAuthor }
