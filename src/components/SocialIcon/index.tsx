import Link from '../Link'

import { ReactComponent as DiscordIcon } from './discord.svg'
import { ReactComponent as GithubIcon } from './github.svg'
import { ReactComponent as LinkedInNoBgIcon } from './linkedin-no-bg.svg'
import { ReactComponent as LinkedInIcon } from './linkedin.svg'
import { ReactComponent as TwitterIcon } from './twitter.svg'
import { ReactComponent as YoutubeIcon } from './youtube.svg'

const icons: { [site: string]: JSX.Element } = {
  linkedin: <LinkedInIcon />,
  linkedinNoBg: <LinkedInNoBgIcon />,
  github: <GithubIcon />,
  twitter: <TwitterIcon viewBox="5 5 30 30" />,
  discord: <DiscordIcon />,
  youtube: <YoutubeIcon />
}

export interface ISocialIcon {
  url: string
  site?: string
  label?: string
}

export interface ISocialIconProps extends ISocialIcon {
  className?: string
}

/*
   Returns a link containing an icon corresponding to the provided site

   Given the situation where either the given link has no site or we don't have
   an icon for it, we return null such that nothing is rendered in map
   functions.
*/
const SocialIcon: React.FC<ISocialIconProps> = ({
  site,
  url,
  className,
  label
}): JSX.Element | null => {
  const icon: JSX.Element = icons[site!]
  return icon ? (
    <Link href={url} className={className} aria-label={label || site}>
      {icon}
    </Link>
  ) : null
}

export default SocialIcon
