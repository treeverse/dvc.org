import { Portal } from '@reach/portal'
import cn from 'classnames'
import { useState } from 'react'

import { isTriggeredFromKB } from '../../../../../utils/front/keyboard'

import * as styles from './styles.module.css'

interface IMobileViewProps {
  description: string
  header: string
  text: React.ReactNode
}

const MobileView: React.FC<IMobileViewProps> = ({
  description,
  header,
  text
}) => {
  const [isVisible, setVisible] = useState(false)
  const openTooltip = (e: React.MouseEvent<HTMLSpanElement>): void => {
    e.stopPropagation()
    setVisible(true)
  }
  const onOpenKeyDown = (e: React.KeyboardEvent): void => {
    if (isTriggeredFromKB(e)) {
      setVisible(true)
    }
  }
  const closeTooltip = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation()
    setVisible(false)
  }
  const onCloseKeyDown = (e: React.KeyboardEvent): void => {
    if (isTriggeredFromKB(e)) {
      setVisible(false)
    }
  }

  return (
    <>
      <span
        className={styles.highlightedText}
        onClick={openTooltip}
        onKeyDown={onOpenKeyDown}
        role="button"
        tabIndex={0}
      >
        {text}
      </span>
      {isVisible && (
        <Portal>
          {/* eslint-disable jsx-a11y/no-static-element-interactions*/}
          {/* eslint-disable jsx-a11y/click-events-have-key-events */}
          <div className={styles.modalBackground} onClick={closeTooltip}>
            {/* eslint-enable jsx-a11y/no-static-element-interactions*/}
            {/* eslint-enable jsx-a11y/click-events-have-key-events */}
            <div className={styles.modalContent}>
              <div
                className={styles.closeContainer}
                onClick={closeTooltip}
                onKeyPress={onCloseKeyDown}
                role="button"
                tabIndex={0}
              >
                <div className={cn(styles.closeLine, styles.first)} />
                <div className={cn(styles.closeLine, styles.second)} />
              </div>
              <h5 className={styles.modalHeader}>{header}</h5>
              <div
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

export default MobileView
