import { externalUrls, mainSiteUrls, docUrls } from '../consts'

export type PopupName = 'dataVersionControlPopup' | 'communityPopup'

export interface INavLinkData {
  href: string
  eventType: string
  text: string
  className?: string
}

export interface INavLinkPopupData {
  text: string
  popupName: PopupName
  items: Array<{ label: string; href: string }>
  analyticsKey: string
  ariaLabel?: string
  className?: string
  href?: string
  hideDropdown?: boolean
}

interface IMenuData {
  nav: Array<INavLinkData | INavLinkPopupData>
}

const menuData: IMenuData = {
  nav: [
    {
      text: 'Data Version Control',
      href: docUrls.home,
      popupName: 'dataVersionControlPopup',
      items: [
        {
          label: 'For AI/ML and Data Infrastructure',
          href: externalUrls.lakefsHome
        },
        { label: 'For Local Workflows (Git Extension)', href: docUrls.home }
      ],
      analyticsKey: 'dataVersionControl'
    },
    { href: docUrls.home, eventType: 'doc', text: 'Doc' },
    { href: mainSiteUrls.blog, eventType: 'blog', text: 'Blog' },
    { href: externalUrls.course, eventType: 'course', text: 'Course' },
    {
      text: 'Community',
      href: mainSiteUrls.community,
      popupName: 'communityPopup',
      items: [
        { label: 'Meet the Community', href: mainSiteUrls.community },
        {
          label: 'Testimonials',
          href: `${mainSiteUrls.community}#testimonials`
        },
        { label: 'Contribute', href: `${mainSiteUrls.community}#contribute` },
        { label: 'Learn', href: `${mainSiteUrls.community}#learn` },
        { label: 'Events', href: `${mainSiteUrls.community}#events` }
      ],
      analyticsKey: 'community'
    }
  ]
}

export default menuData
