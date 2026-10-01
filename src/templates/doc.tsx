import { graphql, HeadProps, PageProps } from 'gatsby'
import { Element } from 'hast'

import Documentation from '../components/Documentation'
import DocumentationLayout from '../components/Documentation/Layout'
import MainLayout, { LayoutModifiers } from '../components/MainLayout'
import SEO from '../components/SEO'
import { getItemByPath } from '../utils/shared/sidebar'

const DocPage: React.FC<
  PageProps<
    {
      page: {
        description?: string
        title?: string
        parent: {
          htmlAst: Element
        }
      }
    },
    {
      slug: string
      headings: []
      is404: boolean
      isAlertLanding: boolean
      pageInfo?: {
        currentPage: number
        nextPage?: string
      }
    }
  >
> = ({ data, pageContext, location }) => {
  const { headings } = pageContext
  const { pathname } = location
  const {
    page: {
      parent: { htmlAst }
    }
  } = data

  return (
    <MainLayout modifiers={[LayoutModifiers.Wide, LayoutModifiers.Collapsed]}>
      <DocumentationLayout currentPath={pathname}>
        <Documentation htmlAst={htmlAst} path={pathname} headings={headings} />
      </DocumentationLayout>
    </MainLayout>
  )
}

export default DocPage

export const pageQuery = graphql`
  query DocPage($id: String!) {
    page: docsPage(id: { eq: $id }) {
      description
      title
      parent {
        ... on MarkdownRemark {
          htmlAst
        }
      }
    }
  }
`

export const Head: React.FC<
  HeadProps<{
    page: {
      description?: string
      title?: string
    }
  }>
> = ({ location, data }) => {
  const { label } = getItemByPath(location.pathname)
  return (
    <SEO
      title={data.page.title || label}
      description={data.page.description}
      pathname={location.pathname}
    />
  )
}
