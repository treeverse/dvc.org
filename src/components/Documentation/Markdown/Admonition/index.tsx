import cn from 'classnames'
import { PropsWithChildren } from 'react'

import * as styles from './styles.module.css'

const icons: { [key: string]: string } = {
  tip: '💡',
  info: 'ℹ️',
  warn: '⚠️',
  fire: '🔥',
  exclamation: '❗',
  lady_beetle: '🐞',
  bug: '🐛',
  book: '📖',
  none: ''
}
const typeOptions = ['info', 'tip', 'warn']
const defaultType = 'info'

const Admonition: React.FC<
  PropsWithChildren<{
    title?: string
    type?: 'info' | 'tip' | 'warn'
    icon?:
      | 'tip'
      | 'info'
      | 'warn'
      | 'fire'
      | 'exclamation'
      | 'lady_beetle'
      | 'bug'
      | 'none'
  }>
> = ({ title, type = defaultType, children, icon = '' }) => {
  const setType = typeOptions.includes(type) ? type : defaultType
  const iconContent = icon in icons ? icons[icon] : icons[setType]
  return (
    <div
      className={cn(styles.admonition, styles[setType])}
      style={{ '--icon': `"${iconContent}"` } as React.CSSProperties}
    >
      {title && (
        <p className={cn(styles.title, !iconContent && styles.noIcon)}>
          {title}
        </p>
      )}
      <div className={cn(styles.content, title && styles.noIcon)}>
        {children}
      </div>
    </div>
  )
}

export default Admonition
