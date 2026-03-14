import cn from 'classnames'
import { HeadProps } from 'gatsby'

import DocLayout from '../../components/Documentation/Layout'
import DocWithJsx from '../../components/Documentation/WithJSX'
import AutoLinkElement from '../../components/Documentation/WithJSX/AutoLinkElement'
import MainLayout from '../../components/MainLayout'
import SEO from '../../components/SEO'
import useGlossary from '../../utils/front/glossary'

const Glossary = () => {
  const { contents } = useGlossary()
  const pagePath = '/user-guide/glossary'

  return (
    <MainLayout>
      <DocLayout currentPath={pagePath}>
        <DocWithJsx path={pagePath} headings={[]}>
          <div className={cn('markdown-body')}>
            <AutoLinkElement el="h1" id="glossary">
              Glossary
            </AutoLinkElement>
            {contents
              .sort((c1, c2) => {
                const c1Name = c1.name.toLowerCase()
                const c2Name = c2.name.toLowerCase()
                return c1Name < c2Name ? -1 : c2Name < c1Name ? 1 : 0
              })
              .map(
                ({ name, desc }: { name: string; desc: string }, i: number) => (
                  <p key={i}>
                    <strong>
                      <AutoLinkElement
                        id={name
                          .toLowerCase()
                          .replace(/[^a-zA-Z0-9 ]/g, '')
                          .replace(/ /g, '-')}
                        anchorStyle={{ paddingTop: '4px' }}
                      >
                        {name}
                      </AutoLinkElement>
                    </strong>
                    :{' '}
                    <span
                      dangerouslySetInnerHTML={{
                        __html: desc.replace(/<\/?p>/g, '')
                      }}
                    ></span>
                  </p>
                )
              )}
          </div>
        </DocWithJsx>
      </DocLayout>
    </MainLayout>
  )
}

export default Glossary

export const Head = ({ location }: HeadProps) => (
  <SEO title="Glossary" pathname={location.pathname} />
)
