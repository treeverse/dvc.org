import { useStaticQuery, graphql } from 'gatsby'

interface ISiteMeta {
  title: string
  description: string
  keywords: string
  siteUrl: string
  titleTemplate: string
  imageAlt?: string
  twitterUsername?: string
}

export default function useSiteMeta(): ISiteMeta {
  const {
    site: { siteMetadata }
  } = useStaticQuery(graphql`
    query SiteMetadata {
      site {
        siteMetadata {
          title
          description
          keywords
          siteUrl
          titleTemplate
          imageAlt
          twitterUsername
        }
      }
    }
  `)

  return siteMetadata
}
