import { IGatsbyImageData } from 'gatsby-plugin-image'
import { useMemo } from 'react'

import useSiteMeta from '../../queries/useSiteMeta'

import { buildMetadata } from './helper'

export interface IPaginatorPageInfo {
  currentPage: number
  nextPage?: string
  previousPage?: string
}

export interface ISEOProps {
  title?: string
  defaultMetaTitle?: boolean
  description?: string
  keywords?: string
  imageAlt?: string
  image?: IGatsbyImageData | string
  imageHeight?: number
  imageWidth?: number
  canonicalUrl?: string
  pathname?: string
  pageInfo?: IPaginatorPageInfo
  children?: React.ReactNode
}

const SEO: React.FC<ISEOProps> = ({
  title,
  defaultMetaTitle,
  description,
  keywords,
  image = '/social-share.png',
  imageAlt = '',
  imageHeight = 630,
  imageWidth = 1200,
  canonicalUrl,
  pathname,
  pageInfo,
  children
}) => {
  const siteMeta = useSiteMeta()
  const fullUrl = siteMeta.siteUrl + pathname
  const pageTitle = useMemo(() => {
    return pageInfo && pageInfo.currentPage > 1
      ? `${title || siteMeta.title} page ${pageInfo.currentPage}`
      : title
  }, [title, siteMeta, pageInfo])
  const prebuildMeta = useMemo(() => {
    return buildMetadata({
      siteUrl: siteMeta.siteUrl,
      siteName: siteMeta.title,
      title: pageTitle || siteMeta.title,
      defaultMetaTitle,
      description: description || siteMeta.description,
      keywords: keywords || siteMeta.keywords,
      image,
      imageAlt: imageAlt || siteMeta.imageAlt,
      imageHeight,
      imageWidth,
      pathname,
      twitterUsername: siteMeta.twitterUsername
    })
  }, [
    siteMeta,
    pageTitle,
    defaultMetaTitle,
    description,
    keywords,
    image,
    imageAlt,
    imageWidth,
    imageHeight,
    pathname
  ])
  const canonical = canonicalUrl || fullUrl
  return (
    <>
      <html lang="en" />
      {canonical && <link rel="canonical" href={canonical} />}
      <title>
        {pageTitle ? `${pageTitle} | ${siteMeta.title}` : siteMeta.title}
      </title>
      {prebuildMeta.map((m, i) => (
        <meta key={i} {...m} />
      ))}
      {children}
    </>
  )
}

export * from './helper'

export default SEO
