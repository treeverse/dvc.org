import { useLocation } from '@gatsbyjs/reach-router'
import { useEffect } from 'react'

import { handleFrontRedirect } from '../../utils/shared/redirects'

export const useRedirects = (): void => {
  const location = useLocation()

  useEffect(() => {
    handleFrontRedirect(location.host, location.pathname)
  }, [location])
}
