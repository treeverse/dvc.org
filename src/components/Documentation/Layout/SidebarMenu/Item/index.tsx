import cn from 'classnames'
import includes from 'lodash/includes'
import { SyntheticEvent, useEffect, useState } from 'react'
import { Collapse } from 'react-collapse'

import { getPathWithSource } from '../../../../../utils/shared/sidebar'
import Link from '../../../../Link'
import ICONS from '../icons'
import * as styles from '../styles.module.css'

import { ReactComponent as ExternalLinkIcon } from './external-link-icon.svg'

interface ISidebarMenuItemProps {
  children?: Array<{ label: string; path: string; source: boolean | string }>
  label: string
  path: string
  source: boolean | string
  onClick: (isLeafItemClicked: boolean) => void
  activePaths?: Array<string>
  type?: string
  style?: string
  icon?: string
}

const SidebarMenuItem: React.FC<ISidebarMenuItemProps> = ({
  children,
  label,
  path,
  activePaths,
  onClick,
  style,
  icon,
  type
}) => {
  const [isExpanded, setIsExpanded] = useState(
    activePaths && includes(activePaths, path)
  )

  useEffect(() => {
    setIsExpanded(activePaths && includes(activePaths, path))
  }, [activePaths, path])

  const isRootParent =
    activePaths && activePaths.length > 1 && activePaths[0] === path

  const isLeafItem = children === undefined || children.length === 0

  const currentLevelOnClick = (
    event: SyntheticEvent<HTMLAnchorElement>
  ): void => {
    if (event.currentTarget.getAttribute('aria-current') === 'page') {
      event.preventDefault()
      setIsExpanded(!isExpanded)
    }
    onClick(isLeafItem)
  }

  const bulletIconClick = (event: SyntheticEvent<HTMLSpanElement>): void => {
    event.preventDefault()
    setIsExpanded(!isExpanded)
  }

  // Fetch a special icon if one is defined
  const IconComponent = icon && ICONS[icon]
  const iconElement = IconComponent ? (
    <IconComponent className={styles.specialIcon} />
  ) : null

  const className = cn(
    styles.sectionLink,
    isExpanded && styles.active,
    isRootParent && 'docSearch-lvl0',
    'link-with-focus',
    // style ? styles[style] : styles.sidebarDefault,
    style && styles[style],
    // isLeafItem && styles.leafItem,
    // Limit the default bullet to items with no special icon
    // icon ? undefined : styles.withDefaultBullet
    icon && undefined
  )

  const bulletIconClassName = cn(
    styles.sidebarDefaultBullet,
    isExpanded && styles.active,
    isLeafItem && styles.sidebarLeafBullet
  )

  const bulletIconJSX = isLeafItem ? (
    <span className={bulletIconClassName}></span>
  ) : (
    <button onClick={bulletIconClick} className={bulletIconClassName}></button>
  )

  const parentElement =
    type === 'external' ? (
      <Link
        href={path}
        id={path}
        className={className}
        onClick={currentLevelOnClick}
        target="_blank"
      >
        {iconElement ? (
          iconElement
        ) : (
          <span className={bulletIconClassName}></span>
        )}
        {label} <ExternalLinkIcon />
      </Link>
    ) : (
      <Link
        href={getPathWithSource(path)}
        id={path}
        className={className}
        onClick={currentLevelOnClick}
      >
        {iconElement ? iconElement : bulletIconJSX}
        {label}
      </Link>
    )

  return (
    <>
      {parentElement}
      {children && (
        <span hidden={!isExpanded}>
          <Collapse isOpened={!!isExpanded}>
            {children.map(item => (
              <SidebarMenuItem
                key={item.path}
                activePaths={activePaths}
                onClick={onClick}
                {...item}
              />
            ))}
          </Collapse>
        </span>
      )}
    </>
  )
}

export default SidebarMenuItem
