import { PropsWithChildren } from 'react'

import Slugger from '../../../../utils/front/Slugger'
import { DownloadLink, NoPreRedirectLink } from '../../../Link'
import Callout from '../Callout'
import { Tab, Toggle } from '../ToggleProvider'

import { Abbr, Card, Cards, Details, InfoCard } from './default'

export const getComponents = (slugger: Slugger) => ({
  a: NoPreRedirectLink,
  abbr: Abbr,
  card: Card,
  cards: Cards,
  details: ({
    id,
    children,
    type,
    color,
    icon,
    open
  }: PropsWithChildren<{
    id: string
    type?: string
    color?: string
    icon?: string
    open?: boolean
  }>) => (
    <Details
      slugger={slugger}
      id={id}
      type={type}
      color={color}
      icon={icon}
      open={open}
    >
      {children}
    </Details>
  ),
  toggle: Toggle,
  tab: Tab,
  admon: Callout,
  admonition: Callout,
  downloadlink: DownloadLink,
  infocard: InfoCard
})
