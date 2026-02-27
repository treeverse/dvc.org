import cn from 'classnames'
import { PropsWithChildren } from 'react'

import menuData from '@dvcorg/gatsby-theme/src/data/menu'
import { logEvent } from '@dvcorg/gatsby-theme/src/utils/front/plausible'

import Link from '../../../Link'

import * as styles from './styles.module.css'

export interface IPopupProps {
  isVisible: boolean
  closePopup: () => void
}

export const BasePopup: React.FC<
  PropsWithChildren<{
    className?: string
    isVisible: boolean
  }>
> = ({ children, isVisible, className }) => (
  <div className={cn(styles.popup, isVisible && styles.visible, className)}>
    {children}
  </div>
)

export const DataVersionControlPopup: React.FC<IPopupProps> = ({
  isVisible,
  closePopup
}) => (
  <BasePopup className={styles.communityPopup} isVisible={isVisible}>
    {menuData.dataVersionControl.map(({ text, title, href }, i) => (
      <Link
        className={styles.link}
        href={href}
        key={i}
        onClick={(): void => {
          logEvent('Nav', { Item: 'dataVersionControl' })
          closePopup()
        }}
      >
        {text || title}
      </Link>
    ))}
  </BasePopup>
)

export const CommunityPopup: React.FC<IPopupProps> = ({
  isVisible,
  closePopup
}) => (
  <BasePopup className={styles.communityPopup} isVisible={isVisible}>
    {menuData.community.map(({ text, title, href }, i) => (
      <Link
        className={styles.link}
        href={href}
        key={i}
        onClick={(): void => {
          logEvent('Nav', { Item: 'community' })
          closePopup()
        }}
      >
        {text || title}
      </Link>
    ))}
  </BasePopup>
)

export const OtherPopup: React.FC<IPopupProps> = ({
  isVisible,
  closePopup
}) => (
  <BasePopup className={styles.otherPopup} isVisible={isVisible}>
    {menuData.nav.map(
      ({ text, href }, i) =>
        href && (
          <Link
            className={styles.link}
            href={href}
            key={i}
            onClick={closePopup}
          >
            {text as React.ReactNode}
          </Link>
        )
    )}
  </BasePopup>
)
