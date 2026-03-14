import { Element } from 'hast'
import { createElement, Fragment } from 'react'
import rehypeReact from 'rehype-react'

import patchHtmlAst from '../../../utils/front/patchHtmlAst'
import Slugger from '../../../utils/front/Slugger'

import { getComponents } from './components'
import Main from './Main'
import { TogglesProvider } from './ToggleProvider'

// Rehype's typedefs don't allow for custom components, even though they work
const renderAst = (slugger: Slugger) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (rehypeReact as any)({
    createElement: createElement,
    Fragment,
    components: getComponents(slugger)
  }).Compiler
}

interface IMarkdownProps {
  htmlAst: Element
  githubLink: string
  tutorials?: { [type: string]: string }
  prev?: string
  next?: string
}

const Markdown: React.FC<IMarkdownProps> = ({
  htmlAst,
  prev,
  next,
  tutorials,
  githubLink
}) => {
  const slugger = new Slugger()
  const patchedAst = patchHtmlAst(htmlAst)
  return (
    <Main prev={prev} next={next} tutorials={tutorials} githubLink={githubLink}>
      <TogglesProvider>{renderAst(slugger)(patchedAst)}</TogglesProvider>
    </Main>
  )
}

export default Markdown
