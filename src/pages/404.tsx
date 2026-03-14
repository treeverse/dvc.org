import { HeadProps } from 'gatsby'

import MainLayout from '@/components/MainLayout'
import NotFound from '@/components/NotFound'
import SEO from '@/components/SEO'

const NotFoundPage = () => (
  <MainLayout className="mt-14">
    <NotFound />
  </MainLayout>
)

export default NotFoundPage

export const Head = ({ location }: HeadProps) => (
  <SEO
    description="404 | This page could not be found"
    title="404 | This page could not be found"
    pathname={location.pathname}
  />
)
