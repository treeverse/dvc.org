export const onRenderBody = (
  { setHeadComponents, setPreBodyComponents },
  { id, includeInDevelopment = false }
) => {
  if (process.env.NODE_ENV === `production` || includeInDevelopment) {
    setHeadComponents([
      <script
        key="google-tag-manager-init"
        dangerouslySetInnerHTML={{
          __html: `
                    window.dataLayer = window.dataLayer || [];
                    window.dataLayer.push({'platform': 'gatsby'});
                    window.dataLayer.push({'gtm.start': new Date().getTime(), event:'gtm.js'});
`
        }}
      />,
      <script
        key="google-tag-manager"
        async
        src={`https://www.googletagmanager.com/gtm.js?id=${id}`}
        data-uc-allowed="true"
      />
    ])

    setPreBodyComponents([
      <noscript key="google-tag-manager-noscript">
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${id}`}
          title="Google Tag Manager"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          aria-hidden="true"
        />
      </noscript>
    ])
  }
}
