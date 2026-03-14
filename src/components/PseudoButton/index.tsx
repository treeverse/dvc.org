import cn from 'classnames'

import Link, { ILinkProps } from '../Link'

import * as styles from './styles.module.css'

type IPseudoButtonProps = {
  children: React.ReactNode
  className?: string
  type?: 'primary' | 'secondary'
  size?: 'small' | 'big' | 'none'
} & ILinkProps

const PseudoButton: React.FC<IPseudoButtonProps> = ({
  children,
  className,
  type = 'primary',
  size = 'small',
  ...restProps
}) => (
  <Link
    className={cn(
      styles.button,
      styles[type],
      styles[size],
      className || styles.defaultButton
    )}
    {...restProps}
  >
    {children}
  </Link>
)

export default PseudoButton
