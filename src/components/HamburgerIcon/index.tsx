import cn from 'classnames'

import * as styles from './styles.module.css'

interface IHamburgerProps {
  opened?: boolean
}

const HamburgerIcon: React.FC<IHamburgerProps> = ({ opened }) => (
  <div
    className={cn(
      'inline-block',
      'cursor-pointer',
      styles.wrapper,
      opened && styles.opened
    )}
  >
    <div className={cn(styles.line, styles.first)} />
    <div className={cn(styles.line, styles.second)} />
  </div>
)

export default HamburgerIcon
