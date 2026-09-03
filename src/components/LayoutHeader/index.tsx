import cn from 'clsx/lite'
import { useCallback, useState } from 'react'

import LayoutWidthContainer from '../LayoutWidthContainer'

import LayoutAlert from './Alert'
import { dismissAlert } from './Alert/state'
import { HeaderBranding } from './HeaderBranding'
import Nav from './Nav'
import * as styles from './styles.module.css'

const LayoutHeader: React.FC = () => {
  const [opened, setOpened] = useState(false)
  const handleToggle = useCallback(() => setOpened(prev => !prev), [])
  const handleClose = useCallback(() => setOpened(false), [])

  return (
    <>
      <div aria-hidden="true" className={styles.alertSpacer} />
      <header id="header" className={styles.headerContainer}>
        <LayoutAlert onDismiss={dismissAlert} />
        <LayoutWidthContainer
          className={cn(styles.header, 'py-2', 'px-3')}
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
