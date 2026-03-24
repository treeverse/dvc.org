import cn from 'classnames'
import { PropsWithChildren } from 'react'

import 'github-markdown-css/github-markdown.css'
import useCustomYtEmbeds from '../../../../utils/front/useCustomYtEmbeds'
import { getPathWithSource } from '../../../../utils/shared/sidebar'
import Link from '../../../Link'
import * as sharedStyles from '../../styles.module.css'
import Tutorials from '../../TutorialsLinks'

import * as styles from './styles.module.css'
import * as themeStyles from './theme.module.css'
import { useArgsTargetFlash } from './useArgsTargetFlash'

interface IMainProps {
  githubLink: string
  tutorials?: { [type: string]: string }
  prev?: string
  next?: string
}

const Main: React.FC<PropsWithChildren<IMainProps>> = ({
  children,
  prev,
  next,
  tutorials,
  githubLink
}) => {
  useArgsTargetFlash()
  useCustomYtEmbeds()

  return (
    <div className={styles.content} id="markdown-root">
      {tutorials && (
        <div className={styles.tutorialsWrapper}>
          <Tutorials tutorials={tutorials} compact={true} />
        </div>
      )}
      <Link
        className={cn(sharedStyles.button, styles.githubLink)}
        href={githubLink}
        target="_blank"
      >
        <i className={cn(sharedStyles.buttonIcon, styles.githubIcon)} /> Edit on
        GitHub
      </Link>
      <div className={cn('markdown-body', themeStyles.code)}>{children}</div>
      <div className={styles.navButtons}>
        <Link className={styles.navButton} href={prev || '#'}>
          <i className={cn(styles.navButtonIcon, styles.prev)} />
          <span>Prev</span>
        </Link>
        <Link
          className={styles.navButton}
          href={next ? getPathWithSource(next) : '#'}
        >
          <span>Next</span>
          <i className={cn(styles.navButtonIcon, styles.next)} />
        </Link>
      </div>
    </div>
  )
}

export default Main
