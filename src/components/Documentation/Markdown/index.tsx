import { Element } from 'hast'
import { toJsxRuntime } from 'hast-util-to-jsx-runtime'
import { Fragment, jsx, jsxs } from 'react/jsx-runtime'

import patchHtmlAst from '../../../utils/front/patchHtmlAst'
import Slugger from '../../../utils/front/Slugger'

import { getComponents } from './components'
import Main from './Main'
import { TogglesProvider } from './ToggleProvider'

/* eslint-disable @typescript-eslint/no-explicit-any */
const renderAst = (slugger: Slugger) => (tree: Element) =>
  toJsxRuntime(
    tree as any,
    {
      Fragment,
      jsx,
      jsxs,
      components: getComponents(slugger)
    } as any
  )
/* eslint-enable @typescript-eslint/no-explicit-any */

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
