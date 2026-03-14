import { getSrc, IGatsbyImageData } from 'gatsby-plugin-image'

export type MetaProps = JSX.IntrinsicElements['meta']
export type LinkProps = JSX.IntrinsicElements['link']

export const getMetaTitle = (title: string): MetaProps[] => {
  return [
    {
      property: 'og:title',
      content: title
    },
    {
      name: 'twitter:title',
      content: title
    }
  ]
}

export const getMetaDescription = (description: string): MetaProps[] => {
  return [
    {
      name: 'description',
      content: description
    },
    {
      property: 'og:description',
      content: description
    },
    {
      name: 'twitter:description',
      content: description
    }
  ]
}

export const getMetaImage = (
  imageUrl: string,
  imageAlt?: string,
  imageHeight?: number,
  imageWidth?: number
): MetaProps[] => {
  return [
    { property: 'og:image', content: imageUrl },
    { name: 'og:image:alt', content: imageAlt },
    { property: 'og:image:width', content: String(imageWidth) },
    { property: 'og:image:height', content: String(imageHeight) },
    { name: 'twitter:image', content: imageUrl },
    { name: 'twitter:image:alt', content: imageAlt }
  ]
}

export const buildMetadata = ({
  siteUrl,
  siteName,
  title,
  defaultMetaTitle,
  description,
  keywords,
  image,
  imageAlt,
  imageHeight,
  imageWidth,
  pathname,
  twitterUsername
}: {
  siteUrl: string
  siteName?: string
  title?: string
  defaultMetaTitle?: boolean
  description?: string
  keywords?: string
  image?: IGatsbyImageData | string
  imageAlt?: string
  imageHeight?: number
  imageWidth?: number
  pathname?: string
  twitterUsername?: string
}) => {
  const prebuildMeta: MetaProps[] = [
    {
      property: 'og:site_name',
      content: siteName
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:locale',
      content: 'en_US'
    },
    {
      name: 'twitter:card',
      content: 'summary'
    }
  ]

  if (title && !defaultMetaTitle) {
    prebuildMeta.push(...getMetaTitle(title))
  }
  if (description) {
    prebuildMeta.push(...getMetaDescription(description))
  }
  if (keywords) {
    prebuildMeta.push({
      name: 'keywords',
      content: keywords
    })
  }
  if (image) {
    const isStr = typeof image === 'string'
    const imageUrl = isStr
      ? image.startsWith('http')
        ? image
        : siteUrl + image
      : siteUrl + getSrc(image)
    prebuildMeta.push(
      ...getMetaImage(imageUrl, imageAlt, imageHeight, imageWidth)
    )
  }
  if (pathname) {
    const fullUrl = siteUrl + pathname
    prebuildMeta.push({
      name: 'og:url',
      content: fullUrl
    })
  }
  if (twitterUsername) {
    prebuildMeta.push(
      ...[
        {
          name: 'twitter:creator',
          content: twitterUsername
        },
        {
          name: 'twitter:site',
          content: twitterUsername
        }
      ]
    )
  }
  return prebuildMeta
}
