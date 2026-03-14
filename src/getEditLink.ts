import { externalUrls } from './consts.js'

const getEditLink = (sourcePath: string): string =>
  `${externalUrls.dvcOrgRepo}/blob/main/content${sourcePath}`
export default getEditLink
