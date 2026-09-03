import { wrapPageElement } from './gatsby-shared'
import {
  ALERT_DISMISSED_ATTRIBUTE,
  ALERT_DISMISSED_STORAGE_KEY
} from './src/components/LayoutHeader/Alert/state'

const alertInitScript = `
try {
  if (localStorage.getItem(${JSON.stringify(
    ALERT_DISMISSED_STORAGE_KEY
  )}) === 'true') {
    document.body.setAttribute(${JSON.stringify(
      ALERT_DISMISSED_ATTRIBUTE
    )}, '');
  }
} catch(e) {}
`

const themeInitScript = `
void function() {
  var STORAGE_KEY = 'theme-mode';
  var EVENT_NAME = 'theme-modechange';

  function isExplicit(v) { return v === 'light' || v === 'dark'; }

  function getSystemTheme() {
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    catch(e) { return 'light'; }
  }

  function resolve(mode) { return isExplicit(mode) ? mode : getSystemTheme(); }

  function setTheme(mode) {
    var resolved = resolve(mode);
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(resolved + '-mode');
    document.body.dataset.themeMode = mode;
    window.__themeMode = mode;
    window.__resolvedTheme = resolved;
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { mode: mode, resolved: resolved } }));
  }

  function persist(mode) {
    try {
      if (isExplicit(mode)) localStorage.setItem(STORAGE_KEY, mode);
      else localStorage.removeItem(STORAGE_KEY);
    } catch(e) {}
  }

  window.__setThemeMode = function(mode) { persist(mode); setTheme(mode); };

  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch(e) {}
  var mode = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';

  setTheme(mode);

  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
      if (!isExplicit(window.__themeMode)) setTheme(window.__themeMode);
    });
  } catch(e) {}
}();
`

export const onRenderBody = ({ setHeadComponents, setPreBodyComponents }) => {
  const preloadFonts = [
    'brandon_reg',
    'brandon_reg_it',
    'brandon_med',
    'brandon_bld'
  ]
  setHeadComponents(
    preloadFonts.map(name => (
      <link
        key={`preload-${name}`}
        rel="preload"
        href={`/fonts/${name}.woff2`}
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
    ))
  )
  setPreBodyComponents([
    <script
      key="layout-alert-init"
      id="layout-alert-init"
      data-uc-allowed="true"
      dangerouslySetInnerHTML={{ __html: alertInitScript }}
    />,
    <script
      key="theme-mode-init"
      id="theme-mode-init"
      data-uc-allowed="true"
      dangerouslySetInnerHTML={{ __html: themeInitScript }}
    />
  ])
}

export { wrapPageElement }
