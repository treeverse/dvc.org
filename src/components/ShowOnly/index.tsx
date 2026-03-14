import cn from 'classnames'

import * as styles from './styles.module.css'

interface IShowOnlyProps {
  on: 'mobile' | 'desktop'
  as?: 'div' | 'span'
  className?: string
  children: React.ReactNode
}

const ShowOnly: React.FC<IShowOnlyProps> = ({
  on,
  as: AS = 'div',
  className,
  children
}) => <AS className={cn(styles[on], className)}>{children}</AS>

export default ShowOnly
