import cn from 'classnames'

import * as styles from './styles.module.css'

interface ILayoutWidthContainerProps {
  className?: string
  children?: React.ReactNode
  wide?: boolean
}

const LayoutWidthContainer: React.FC<ILayoutWidthContainerProps> = ({
  className,
  children,
  wide = false
}) => (
  <div className={cn(className, styles.container, wide && styles.wide)}>
    {children}
  </div>
)

export default LayoutWidthContainer
