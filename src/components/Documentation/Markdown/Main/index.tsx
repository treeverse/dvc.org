import cn from 'classnames'
import { navigate } from 'gatsby'
import { useEffect, useRef, useCallback, PropsWithChildren } from 'react'

import 'github-markdown-css/github-markdown-light.css'
import useCustomYtEmbeds from '../../../../utils/front/useCustomYtEmbeds'
import { getPathWithSource } from '../../../../utils/shared/sidebar'
import Link from '../../../Link'
import * as sharedStyles from '../../styles.module.css'
import Tutorials from '../../TutorialsLinks'

import * as styles from './styles.module.css'
import * as themeStyles from './theme.module.css'

const isInsideCodeBlock = (node: Element): boolean => {
  while (node?.parentNode) {
    if (node.tagName === 'PRE') {
      return true
    }

    if (node.tagName === 'ARTICLE') {
      return false
    }

    node = node.parentNode as Element
  }

  return false
}

interface IMainProps {
  githubLink: string
  tutorials?: { [type: string]: string }
  prev?: string
  next?: string
}

type RawTouchHandler = (this: Document, e: TouchEvent) => void

const Main: React.FC<PropsWithChildren<IMainProps>> = ({
  children,
  prev,
  next,
  tutorials,
  githubLink
}) => {
  const touchstartXRef = useRef(0)
  const touchendXRef = useRef(0)
  const isCodeBlockRef = useRef(false)
  useCustomYtEmbeds()
  const handleSwipeGesture = useCallback(() => {
    if (isCodeBlockRef.current) return

    if (next && touchstartXRef.current - touchendXRef.current > 100) {
      navigate(next)
    }

    if (prev && touchendXRef.current - touchstartXRef.current > 100) {
      navigate(prev)
    }
  }, [prev, next])
  const onTouchStart = useCallback<RawTouchHandler>(e => {
    isCodeBlockRef.current = isInsideCodeBlock(e.target as Element)
    touchstartXRef.current = e.changedTouches[0].screenX
  }, [])
  const onTouchEnd = useCallback<RawTouchHandler>(
    e => {
      touchendXRef.current = e.changedTouches[0].screenX
      handleSwipeGesture()
    },
    [handleSwipeGesture]
  )

  useEffect(() => {
    document.addEventListener('touchstart', onTouchStart, false)
    document.addEventListener('touchend', onTouchEnd, false)

    return (): void => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [onTouchEnd, onTouchStart])

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
