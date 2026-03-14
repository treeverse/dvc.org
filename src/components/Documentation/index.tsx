import { Element } from 'hast'

import getEditLink from '../../getEditLink'
import { getItemByPath } from '../../utils/shared/sidebar'

import Markdown from './Markdown'
import RightPanel from './RightPanel'

export interface IHeading {
  slug: string
  text: string
}

interface IDocumentationProps {
  path: string
  headings: Array<IHeading>
  htmlAst: Element
}

const Documentation: React.FC<IDocumentationProps> = ({
  htmlAst,
  path,
  headings
}) => {
  const { source, prev, next, tutorials } = getItemByPath(path)
  const githubLink = getEditLink(source)

  return (
    <>
      <Markdown
        htmlAst={htmlAst}
        prev={prev}
        next={next}
        githubLink={githubLink}
        tutorials={tutorials}
      />
      <RightPanel
        headings={headings}
        githubLink={githubLink}
        tutorials={tutorials}
      />
    </>
  )
}

export default Documentation
