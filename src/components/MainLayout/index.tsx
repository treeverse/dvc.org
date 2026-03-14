import cn from 'classnames'
import { ReactNode, useEffect } from 'react'

import 'reset-css'
import './base.css'
import './fonts.css'
import { handleFirstTab } from '../../utils/front/accessibility'
import LayoutFooter from '../LayoutFooter'
import LayoutHeader from '../LayoutHeader'

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
  )
}

export default MainLayout
