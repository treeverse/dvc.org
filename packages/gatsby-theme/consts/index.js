const MAIN_SITE_URL = 'https://dvc.org'

const mainSiteUrls = {
  home: MAIN_SITE_URL,
  blog: `${MAIN_SITE_URL}/blog/`,
  chat: `${MAIN_SITE_URL}/chat`,
  support: `${MAIN_SITE_URL}/support/`,
  community: `${MAIN_SITE_URL}/community/`
}
const externalUrls = {
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
const docUrls = {
  home: '/',
  getStarted: `/start`,
  commandReference: `/command-reference/`,
  apiReference: `/api-reference/`,
  exampleScenarios: `/example-scenarios`
}

const consts = {
  CLI_REGEXP: /dvc\s+[a-z][a-z-.]*/,
  COMMAND_REGEXP: /^[a-z][a-z-]*$/,
  ARGS_REGEXP: new RegExp(/-{1,2}[a-zA-Z-]*/, 'ig'),

  CLI_API_REGEXP: /dvc.api([a-z-._]*\(\)$)?/,
  METHOD_REGEXP: /^[a-z-._]*\(\)$/,

  SIDEBAR_UPPERCASE_KEYWORDS_REGEX: /dvc|api/g,
  SIDEBAR_PATH_ROOT: '',
  SIDEBAR_FILE_ROOT: '/docs/',
  SIDEBAR_FILE_EXTENSION: '.md',
  DOCS_PREFIX: '',
  mainSiteUrls,
  externalUrls,
  docUrls
}

module.exports = consts
