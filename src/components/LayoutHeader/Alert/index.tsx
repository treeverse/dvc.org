import cn from 'classnames'

import { AlertContent } from './content'
import * as styles from './styles.module.css'

const LayoutAlert: React.FC<{ collapsed?: boolean }> = ({
  collapsed = false
}) => (
  <div
    className={cn(
      styles.alert,
      'w-full',
      'transition-all',
      'ease-in-out',
      'delay-150',
      'whitespace-nowrap',
      'text-center',
      'truncate',
      'overflow-hidden',
      'px-2',
      collapsed ? 'h-0' : 'h-7'
    )}
  >
    <span className="align-middle">
      <AlertContent />
    </span>
  </div>
)

export default LayoutAlert
