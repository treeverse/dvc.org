import cn from 'clsx/lite'
import { ReactNode, useEffect } from 'react'

import '../../styles/global.css'
import './base.css'
import './fonts.css'
import { handleFirstTab } from '../../utils/front/accessibility'
import LayoutFooter from '../LayoutFooter'
import LayoutHeader from '../LayoutHeader'
import SearchProvider from '../Search'

import { useRedirects } from './utils'

export enum LayoutModifiers {
  Wide,
  Collapsed,
  HideAlert
}

export interface ILayoutModifiable {
  modifiers?: Array<LayoutModifiers>
}

export interface ILayoutComponentProps extends ILayoutModifiable {
  className?: string
  children?: ReactNode
}

const MainLayout = ({
  className,
  children,
  modifiers = []
}: ILayoutComponentProps) => {
  useRedirects()

  useEffect(() => {
    window.addEventListener('keydown', handleFirstTab)

    return (): void => {
      window.removeEventListener('keydown', handleFirstTab)
    }
  }, [])

  return (
    <SearchProvider>
      <div
        className={cn(
          'min-h-screen',
          'w-full',
          'flex',
          'flex-col',
          'flex-nowrap',
          'items-center'
        )}
      >
        <LayoutHeader modifiers={modifiers} />
        <main
          className={cn(
            'w-full',
            'grow',
            'flex',
            'flex-col',
            'flex-nowrap',
            'items-center',
            className
          )}
        >
          {children}
        </main>
        <LayoutFooter />
      </div>
    </SearchProvider>
  )
}

export default MainLayout
