import cn from 'classnames'
import { PropsWithChildren } from 'react'

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

export const NavPopup: React.FC<
  IPopupProps & {
    items: Array<{ label: string; href: string }>
    analyticsKey: string
    onNavigate?: () => void
  }
> = ({ items, analyticsKey, isVisible, closePopup, onNavigate }) => (
  <BasePopup className={styles.navPopup} isVisible={isVisible}>
    {items.map(({ label, href }, i) => (
      <Link
        className={styles.link}
        href={href}
        key={i}
        onClick={(): void => {
          logEvent('Nav', { Item: analyticsKey })
          closePopup()
          onNavigate?.()
        }}
      >
        {label}
      </Link>
    ))}
  </BasePopup>
)
