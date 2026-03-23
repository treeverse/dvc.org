import cn from 'classnames'
import includes from 'lodash/includes'
import { useState, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'

import LayoutWidthContainer from '../LayoutWidthContainer'
import { LayoutModifiers, ILayoutModifiable } from '../MainLayout'

import { HeaderBranding } from './HeaderBranding'
import Nav from './Nav'
import * as styles from './styles.module.css'

const LayoutHeader: React.FC<ILayoutModifiable> = ({ modifiers }) => {
  const { ref, inView } = useInView({ rootMargin: '20px 0px 0px 0px' })
  const scrolled = !inView

  const [opened, setOpened] = useState(false)
  const handleToggle = useCallback(() => setOpened(prev => !prev), [])
  const handleClose = useCallback(() => setOpened(false), [])

  const hasCollapsedModifier = includes(modifiers, LayoutModifiers.Collapsed)
  const collapsed = opened || hasCollapsedModifier || scrolled

  return (
    <>
      <div ref={ref} />
      <header
        id="header"
        data-collapsed={collapsed}
        className={cn(styles.headerContainer)}
      >
        <LayoutWidthContainer
          className={cn(
            styles.header,
            'transition-all',
            'ease-in-out',
            'delay-150',
            'py-2',
            'px-3'
          )}
          wide
        >
          <HeaderBranding onClick={handleClose} />
          <Nav opened={opened} onToggle={handleToggle} onClose={handleClose} />
        </LayoutWidthContainer>
      </header>
    </>
  )
}

export default LayoutHeader
