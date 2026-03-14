import { useLocation } from '@gatsbyjs/reach-router'
import cn from 'classnames'
import {
  AlertTriangle,
  BookOpen,
  Bug,
  ChevronDown,
  CircleAlert,
  Clapperboard,
  Flame,
  Info,
  Lightbulb,
  Settings
} from 'lucide-react'
import {
  FC,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useState
} from 'react'
import Collapsible from 'react-collapsible'

import * as styles from './styles.module.css'

export type CalloutType = 'info' | 'tip' | 'warn'

const typeOptions: CalloutType[] = ['info', 'tip', 'warn']
export const defaultType: CalloutType = 'tip'

export const calloutIcons: Record<
  string,
  FC<{ size?: number; className?: string }> | null
> = {
  tip: Lightbulb,
  bulb: Lightbulb,
  info: Info,
  warn: AlertTriangle,
  fire: Flame,
  exclamation: CircleAlert,
  lady_beetle: Bug,
  bug: Bug,
  book: BookOpen,
  video: Clapperboard,
  gear: Settings,
  none: null
}

export function resolveType(type?: string): CalloutType {
  return typeOptions.includes(type as CalloutType)
    ? (type as CalloutType)
    : defaultType
}

export function resolveIcon(icon?: string, fallbackType?: CalloutType) {
  if (icon && icon in calloutIcons) return calloutIcons[icon]
  if (fallbackType && fallbackType in calloutIcons)
    return calloutIcons[fallbackType]
  return null
}

interface CalloutProps {
  type?: string
  icon?: string
  title?: string
  // Collapsible mode
  collapsible?: boolean
  open?: boolean
  // For collapsible: heading extracted from children (used by details wrapper)
  triggerContent?: ReactNode
  // For collapsible: anchor link id
  id?: string
  anchorLink?: ReactNode
}

const Callout: FC<PropsWithChildren<CalloutProps>> = ({
  type,
  icon = '',
  title,
  collapsible = false,
  open: openProp = false,
  triggerContent,
  id,
  anchorLink,
  children
}) => {
  const resolvedType = resolveType(type)
  const IconComponent = resolveIcon(icon, resolvedType)
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(openProp)

  useEffect(() => {
    if (id && location.hash === `#${id}`) {
      setIsOpen(true)
    }
  }, [id, location.hash])

  // Collapsible mode
  if (collapsible) {
    const triggerEl = triggerContent || title

    const trigger = (
      <span className={styles.triggerInner}>
        {IconComponent && (
          <span className={styles.icon}>
            <IconComponent size={18} />
          </span>
        )}
        <span className={styles.triggerLabel}>{triggerEl}</span>
        <ChevronDown
          size={18}
          className={cn(styles.chevron, isOpen && styles.chevronOpen)}
        />
      </span>
    ) as unknown as ReactElement

    return (
      <div id={id} className={id ? 'collapsableDiv' : undefined}>
        {anchorLink}
        <div className={cn(styles.callout, styles[resolvedType])}>
          <Collapsible
            open={isOpen}
            onOpening={() => setIsOpen(true)}
            onClosing={() => setIsOpen(false)}
            trigger={trigger}
            transitionTime={200}
          >
            <div className={styles.collapsibleContent}>{children}</div>
          </Collapsible>
        </div>
      </div>
    )
  }

  // Static mode (admonition)
  return (
    <div className={cn(styles.callout, styles[resolvedType])}>
      {title ? (
        <p className={styles.title}>
          {IconComponent && (
            <span className={styles.icon}>
              <IconComponent size={20} />
            </span>
          )}
          {title}
        </p>
      ) : (
        IconComponent && (
          <span className={styles.iconFloat}>
            <IconComponent size={20} />
          </span>
        )
      )}
      <div
        className={cn(
          styles.content,
          !title && IconComponent && styles.hasIcon
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default Callout
