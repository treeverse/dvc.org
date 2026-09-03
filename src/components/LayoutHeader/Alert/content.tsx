import Link from '../../Link'

import * as styles from './styles.module.css'

const WEBINAR_URL =
  'https://dvc.org/webinars/end-to-end-lineage-aws-dvc-mlflow/'

export const AlertContent = () => (
  <Link className={styles.alertLink} href={WEBINAR_URL}>
    <span className={styles.message}>
      See how AWS built end-to-end ML lineage with DVC, SageMaker &amp; MLflow
    </span>
    <span className={styles.cta}>
      Join us <time dateTime="2026-09-22">Sept. 22</time>
    </span>
  </Link>
)
