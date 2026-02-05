import { PropsWithChildren } from 'react'

import Slugger from '../../../../utils/front/Slugger'
import { DownloadLink, NoPreRedirectLink } from '../../../Link'
import Admonition from '../Admonition'
import { Tab, Toggle } from '../ToggleProvider'

import { Abbr, Card, Cards, Details } from './default'

export const getComponents = (slugger: Slugger) => ({
  a: NoPreRedirectLink,
  abbr: Abbr,
  card: Card,
  cards: Cards,
  details: ({
    id,
    children,
    color
  }: PropsWithChildren<{ id: string; color?: string }>) => (
    <Details slugger={slugger} id={id} color={color}>
      {children}
    </Details>
  ),
  toggle: Toggle,
  tab: Tab,
  admon: Admonition,
  admonition: Admonition,
  downloadlink: DownloadLink
})
