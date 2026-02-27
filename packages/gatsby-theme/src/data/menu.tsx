import {
  externalUrls,
  mainSiteUrls,
  docUrls
} from '@dvcorg/gatsby-theme/consts'

import { ReactComponent as EllipsisIcon } from '../../../../static/img/ellipsis.svg'
import {
  INavLinkData,
  INavLinkPopupData
} from '../components/LayoutHeader/Nav/LinkItems'
import {
  CommunityPopup,
  OtherPopup
} from '../components/LayoutHeader/Nav/Popup'

import * as styles from './styles.module.css'

interface ICommunityData {
  title: string
  text: string
  href: string
  img: string
  imgAlt: string
}

interface IMenuData {
  community: Array<ICommunityData>
  nav: Array<INavLinkData | INavLinkPopupData>
}

const menuData: IMenuData = {
  nav: [
    {
      href: docUrls.home,
      eventType: 'doc',
      text: 'Doc'
    },
    {
      href: mainSiteUrls.blog,
      eventType: 'blog',
      text: 'Blog'
    },
    {
      href: externalUrls.course,
      eventType: 'course',
      text: 'Course'
    },
    {
      text: 'Community',
      Popup: CommunityPopup,
      href: mainSiteUrls.community,
      popupName: 'communityPopup'
    },
    {
      href: mainSiteUrls.support,
      eventType: 'support',
      text: 'Support'
    },
    {
      text: EllipsisIcon,
      ariaLabel: 'Show options',
      popupName: 'otherPopup',
      Popup: OtherPopup,
      className: styles.other,
      hideDropdown: true
    }
  ],
  community: [
    {
      title: 'Meet Us',
      text: 'Meet the Community',
      href: mainSiteUrls.community,
      img: '/img/community/icon-community.svg',
      imgAlt: ''
    },
    {
      title: 'Testimonials',
      text: '',
      href: `${mainSiteUrls.community}#testimonials`,
      img: '/img/community/icon-community.svg',
      imgAlt: ''
    },
    {
      title: 'Contribute',
      text: '',
      href: `${mainSiteUrls.community}#contribute`,
      img: '/img/community/icon-contribute.svg',
      imgAlt: ''
    },
    {
      title: 'Learn',
      text: '',
      href: `${mainSiteUrls.community}#learn`,
      img: '/img/community/icon-learn.svg',
      imgAlt: ''
    },
    {
      title: 'Events',
      text: '',
      href: `${mainSiteUrls.community}#events`,
      img: '/img/community/icon-events.svg',
      imgAlt: ''
    }
  ]
}

export default menuData
