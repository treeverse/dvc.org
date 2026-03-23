/* eslint-disable @typescript-eslint/no-require-imports */
const React = require('react')

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

exports.onRenderBody = ({ setPreBodyComponents }) => {
  setPreBodyComponents([
    React.createElement('script', {
      key: 'theme-mode-init',
      id: 'theme-mode-init',
      dangerouslySetInnerHTML: { __html: themeInitScript }
    })
  ])
}
exports.wrapPageElement = require('./gatsby-shared').wrapPageElement
