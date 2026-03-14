import { PropsWithChildren } from 'react'

import { IHeading } from '../'
import getEditLink from '../../../getEditLink'
import { getItemByPath } from '../../../utils/shared/sidebar'
import MarkdownMain from '../Markdown/Main'
import RightPanel from '../RightPanel'

interface IWithJSXProps {
  path: string
  headings: Array<IHeading>
}

const WithJSX: React.FC<PropsWithChildren<IWithJSXProps>> = ({
  children,
  path,
  headings
}) => {
  const { source, prev, next, tutorials } = getItemByPath(path)
  const githubLink = getEditLink(source)

  return (
    <>
      <MarkdownMain
        prev={prev}
        next={next}
        githubLink={githubLink}
        tutorials={tutorials}
      >
        {children}
      </MarkdownMain>
      <RightPanel
        headings={headings}
        githubLink={githubLink}
        tutorials={tutorials}
      />
    </>
  )
}

export default WithJSX
