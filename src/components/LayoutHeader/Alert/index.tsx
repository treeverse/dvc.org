import { AlertContent } from './content'
import * as styles from './styles.module.css'

const LayoutAlert: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
  <aside aria-label="Upcoming event" className={styles.alert}>
    <div className={styles.inner}>
      <AlertContent />
      <button
        type="button"
        className={styles.dismissButton}
        onClick={onDismiss}
        aria-label="Dismiss webinar announcement"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M3 3l10 10M13 3L3 13"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      </button>
    </div>
  </aside>
)

export default LayoutAlert
