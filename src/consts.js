const MAIN_SITE_URL = 'https://dvc.org'

export const mainSiteUrls = {
  home: MAIN_SITE_URL,
  blog: `${MAIN_SITE_URL}/blog/`,
  chat: `${MAIN_SITE_URL}/chat`,
  support: `${MAIN_SITE_URL}/support/`,
  community: `${MAIN_SITE_URL}/community/`
}
export const externalUrls = {
  dvcRepo: 'https://github.com/treeverse/dvc',
  dvcOrgRepo: 'https://github.com/treeverse/dvc.org',
  dvcliveRepo: 'https://github.com/treeverse/dvclive',
  forum: 'https://discuss.dvc.org',
  twitter: 'https://x.com/DVCorg',
  course: 'https://learn.dvc.org/',
  mail: 'mailto:support@dvc.org',
  youtube: 'https://www.youtube.com/channel/UC37rp97Go-xIX3aNFVHhXfQ',
  privacyPolicy: 'https://lakefs.io/privacy-policy/',
  lakefsHome: 'https://lakefs.io',
  lakefsAboutUs: 'https://lakefs.io/about-us/'
}
export const docUrls = {
  home: '/',
  getStarted: `/start`,
  commandReference: `/command-reference/`,
  apiReference: `/api-reference/`,
  exampleScenarios: `/example-scenarios`
}

export const CLI_REGEXP = /dvc\s+[a-z][a-z-.]*/
export const COMMAND_REGEXP = /^[a-z][a-z-]*$/
export const ARGS_REGEXP = new RegExp(/-{1,2}[a-zA-Z-]*/, 'ig')
export const CLI_API_REGEXP = /dvc.api([a-z-._]*\(\)$)?/
export const METHOD_REGEXP = /^[a-z-._]*\(\)$/
export const SIDEBAR_UPPERCASE_KEYWORDS_REGEX = /dvc|api/g
export const SIDEBAR_PATH_ROOT = ''
export const SIDEBAR_FILE_ROOT = '/docs/'
export const SIDEBAR_FILE_EXTENSION = '.md'
export const DOCS_PREFIX = ''
