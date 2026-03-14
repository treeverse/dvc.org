function childNodeCreator({
  node,
  actions: { createNode, createParentChildLink }
}) {
  return async function ({ children = [], ...rest }) {
    const newNode = {
      parent: node.id,
      children,
      ...rest
    }

    await createNode(newNode)
    await createParentChildLink({ parent: node, child: newNode })
  }
}

export { childNodeCreator }
