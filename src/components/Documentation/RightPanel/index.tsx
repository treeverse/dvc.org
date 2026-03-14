import cn from 'classnames'
import throttle from 'lodash/throttle'
import { useState, useEffect, useRef, useCallback } from 'react'

import { IHeading } from '../'
import { mainSiteUrls } from '../../../consts'
import { allImagesLoadedInContainer } from '../../../utils/front/images'
import { getScrollPosition } from '../../../utils/front/scroll'
import Link from '../../Link'
import * as sharedStyles from '../styles.module.css'
import Tutorials from '../TutorialsLinks'

import * as styles from './styles.module.css'

interface IRightPanelProps {
  headings: Array<IHeading>
  githubLink: string
  tutorials?: { [type: string]: string }
}

interface IHeadingsCoordinates {
  [offset: string]: string
}

const RightPanel: React.FC<IRightPanelProps> = ({
  headings,
  tutorials,
  githubLink
}) => {
  const [documentHeight, setDocumentHeight] = useState(0)
  const [headingsOffsets, setHeadingsOffsets] = useState<IHeadingsCoordinates>(
    {}
  )
  const [currentHeadingSlug, setCurrentHeadingSlug] = useState<string | null>(
    null
  )
  const updateCurrentHeader = useCallback((): void => {
    const currentScroll = getScrollPosition()
    const coordinateKeys = Object.keys(headingsOffsets)

    if (!coordinateKeys.length) return

    const filteredKeys = coordinateKeys.filter(
      offsetTop => parseInt(offsetTop, 10) <= currentScroll + documentHeight / 2
    )

    const newCurrentHeadingSlug = filteredKeys.length
      ? headingsOffsets[filteredKeys[filteredKeys.length - 1]]
      : null

    setCurrentHeadingSlug(newCurrentHeadingSlug)
  }, [documentHeight, headingsOffsets])

  const updateHeadingsPosition = useCallback((): void => {
    const offsets = headings.reduce(
      (result: IHeadingsCoordinates, heading: IHeading) => {
        const headingElement = document.getElementById(heading.slug)

        if (headingElement?.offsetTop) {
          result[headingElement.offsetTop.toString()] = heading.slug
        }

        return result
      },
      {}
    )
    setHeadingsOffsets(offsets)
    setDocumentHeight(document.documentElement.clientHeight)
  }, [headings])

  const initHeadingsPosition = (): void => {
    const root = document.querySelector('#markdown-root')

    if (root) {
      allImagesLoadedInContainer(root).then(updateHeadingsPosition)
    }
  }

  useEffect(() => {
    const throttledSetCurrentHeader = throttle(updateCurrentHeader, 100)

    document.addEventListener('scroll', throttledSetCurrentHeader)
    window.addEventListener('resize', updateHeadingsPosition)

    return (): void => {
      document.removeEventListener('scroll', throttledSetCurrentHeader)
      window.removeEventListener('resize', updateHeadingsPosition)
    }
  }, [updateCurrentHeader, updateHeadingsPosition])
  useEffect(initHeadingsPosition, [headings, updateHeadingsPosition])
  useEffect(updateCurrentHeader, [updateCurrentHeader])

  const contentBlockRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (currentHeadingSlug !== undefined) {
      const contentBlockElem = contentBlockRef.current
      if (contentBlockElem) {
        if (currentHeadingSlug) {
          const currentHeadingSlugElem = document.getElementById(
            `link-${currentHeadingSlug}`
          )
          if (currentHeadingSlugElem) {
            const hasVerticalScrollbar =
              contentBlockElem.scrollHeight > contentBlockElem.clientHeight
            if (hasVerticalScrollbar) {
              contentBlockElem.scrollTo({
                top:
                  currentHeadingSlugElem.offsetTop -
                  contentBlockElem.clientHeight +
                  currentHeadingSlugElem.clientHeight / 2,
                behavior: 'smooth'
              })
            }
          }
        } else {
          contentBlockElem.scrollTo({
            top: 0
          })
        }
      }
    }
  }, [currentHeadingSlug])

  return (
    <div className={styles.container}>
      {headings.length > 0 && (
        <>
          <div>
            <h5 className={styles.header}>Content</h5>
            <hr />
          </div>
          <div className={styles.contentBlock} ref={contentBlockRef}>
            {headings.map(({ slug, text }) => (
              <div id={`link-${slug}`} key={`link-${slug}`}>
                <Link
                  className={cn(
                    styles.headingLink,
                    currentHeadingSlug === slug && styles.current,
                    'link-with-focus'
                  )}
                  href={`#${slug}`}
                >
                  {text}
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
      <div className={styles.buttonsBlock}>
        {Object.keys(tutorials || {}).length > 0 && (
          <div className={styles.buttonSection}>
            <p className={styles.buttonSectionDescription}>
              <span
                className={styles.buttonSectionIcon}
                role="img"
                aria-label="run"
              >
                ▶️
              </span>{' '}
              It can be run online:
            </p>
            {tutorials && (
              <Tutorials
                buttonClassName={cn(styles.button, styles.tutorials)}
                tutorials={tutorials}
              />
            )}
          </div>
        )}
        <div className={styles.buttonSection}>
          <p className={styles.buttonSectionDescription}>
            <span
              className={styles.buttonSectionIcon}
              role="img"
              aria-label="bug"
            >
              🐛
            </span>{' '}
            Found an issue? Let us know! Or fix it:
          </p>

          <Link
            className={cn(sharedStyles.button, styles.button)}
            href={githubLink}
            target="_blank"
          >
            <i className={cn(sharedStyles.buttonIcon, styles.githubIcon)} />
            Edit on GitHub
          </Link>
        </div>

        <div className={styles.buttonSection}>
          <p className={styles.buttonSectionDescription}>
            <span
              className={styles.buttonSectionIcon}
              role="img"
              aria-label="question"
            >
              ❓
            </span>{' '}
            Have a question? Join our chat, we will help you:
          </p>

          <Link
            className={cn(sharedStyles.button, styles.button)}
            href={mainSiteUrls.chat}
            target="_blank"
          >
            <i className={cn(sharedStyles.buttonIcon, styles.discordIcon)} />
            Discord Chat
          </Link>
        </div>

        <div className={styles.buttonSection}>
          <p className={styles.buttonSectionDescription}>
            <span
              className={styles.buttonSectionIcon}
              role="img"
              aria-label="lakefs"
            >
              🤝
            </span>{' '}
            Data on petabyte scale? Checkout our sister project:
          </p>

          <Link
            className={cn(sharedStyles.button, styles.button)}
            href="https://docs.lakefs.io/latest/index.html"
            target="_blank"
          >
            <i className={cn(sharedStyles.buttonIcon, styles.lakefsIcon)} />
            lakeFS Docs
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RightPanel
