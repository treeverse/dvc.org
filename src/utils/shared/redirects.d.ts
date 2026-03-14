import { ISidebarItem } from './sidebar'

interface IRedirect {
  regex: RegExp
  matchPathname: boolean
  replace: string
  code: number
}

export function buildSidebarRedirects(list: ISidebarItem[]): string[]

export function processRedirectString(redirectString: string): IRedirect

export function getRedirect(
  host: string,
  pathname: string,
  options?: { req: Request; dev: boolean }
): [number, string]

export function handleFrontRedirect(
  host: string,
  pathname: string,
  clickEvent?: MouseEvent
): void
