import Link from '../../Link'
import { ReactComponent as GithubSVG } from '../../SocialIcon/github.svg'

export const AlertContent = () => (
  <>
    <span role="img" aria-label="rocket">
      🚀
    </span>{' '}
    <Link href="https://github.com/treeverse/dvc">
      Star us on <GithubSVG className="h-5 w-5 inline-block align-middle" />
    </Link>
    !
  </>
)
