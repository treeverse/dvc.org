import { useLocation } from '@gatsbyjs/reach-router'
import { Link as GatsbyLink } from 'gatsby'
import { URL } from 'iso-url'

import { mainSiteUrls } from '../../consts.js'
import { getRedirect } from '../../utils/shared/redirects'

export type ILinkProps = {
  children: React.ReactNode
  className?: string
  href: string
  target?: undefined | '_blank'
  state?: unknown
  optOutPreRedirect?: undefined | true
  opt_out_pre_redirect?: string
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

const PROTOCOL_REGEXP = /^https?:\/\//
const isRelative = (url: string): boolean => !PROTOCOL_REGEXP.test(url)
const isMailto = (url: string): boolean => url.startsWith('mailto:')

const VERSION = '3.65.0'

const ResultLinkComponent: React.FC<ILinkProps> = ({
  href,
  children,
  rel,
  target,
  download = false,
  className = 'no-underline text-blue-600 hover:text-blue-800 hover:underline',
  ...restProps
}) => {
  // Handle all situations where a basic `a` must be used over Gatsby Link
  const hrefIsRelative = isRelative(href)
  const hrefIsMailto = isMailto(href)
  const hrefHasTarget = typeof target === 'string'
  // Fragments within the page should be `a`, but links to other pages
  // that have anchors should be okay.
  const hrefIsRelativeFragment = href.startsWith('#')

  const url = new URL(href)

  if (
    download ||
    !hrefIsRelative ||
    hrefIsMailto ||
    hrefHasTarget ||
    hrefIsRelativeFragment
  ) {
    /*
       Change external links without an explicit rel to have 'noopener
       noreferrer', but leave explicitly defined rels alone.
       Do the same with `target=_blank`
    */
    if (!hrefIsRelative && url.origin !== mainSiteUrls.home) {
      if (typeof rel !== 'string') {
        rel = 'noopener noreferrer'
      }
      if (!hrefHasTarget) {
        target = '_blank'
      }
    }

    return (
      <a
        download={download}
        href={href}
        rel={rel}
        target={target}
        className={className}
        {...restProps}
      >
        {children}
      </a>
    )
  }

  return (
    <GatsbyLink to={href} className={className} {...restProps}>
      {children}
    </GatsbyLink>
  )
}

const Link: React.FC<ILinkProps> = ({
  href,
  optOutPreRedirect,
  // remark custom components only support lowercase props and value is always a string
  // eslint-disable-next-line @typescript-eslint/naming-convention
  opt_out_pre_redirect,
  ...restProps
}) => {
  if (opt_out_pre_redirect) {
    optOutPreRedirect =
      opt_out_pre_redirect === 'true' ? true : optOutPreRedirect
  }
  const currentLocation = useLocation()

  const location = new URL(href)

  if (location.host === currentLocation.host && !optOutPreRedirect) {
    // Replace link href with redirect if it exists
    const [, redirectUrl] = getRedirect(location.host, location.pathname)

    if (redirectUrl) {
      href = isRelative(redirectUrl)
        ? redirectUrl + currentLocation.search
        : redirectUrl
    }
  }

  return <ResultLinkComponent href={href} {...restProps} />
}

export const NoPreRedirectLink: React.FC<ILinkProps> = props => (
  <Link {...props} optOutPreRedirect>
    {props.children}
  </Link>
)

export const DownloadLink: React.FC<{
  kind: string
  children: React.ReactNode
}> = ({ kind, children }) => (
  <Link href={`${mainSiteUrls.home}/download/${kind}/dvc-${VERSION}`}>
    {children}
  </Link>
)

export default Link
