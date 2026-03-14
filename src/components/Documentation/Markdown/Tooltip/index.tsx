import includes from 'lodash/includes'
import { useState, useEffect } from 'react'

import useGlossary from '../../../../utils/front/glossary'
import ShowOnly from '../../../ShowOnly'

import DesktopView from './DesktopView'
import MobileView from './MobileView'

const Tooltip: React.FC<{ text: string }> = ({ text }) => {
  const glossary = useGlossary()
  const [state, setState] = useState({
    description: '',
    header: '',
    match: false
  })

  useEffect(() => {
    glossary.contents.forEach(glossaryItem => {
      if (
        includes(
          glossaryItem.match.map(word => word.toLowerCase()),
          text.replace(/\n/g, ' ').toLowerCase()
        )
      ) {
        setState({
          description: glossaryItem.desc,
          header: glossaryItem.name,
          match: true
        })
      }
    })
  }, [glossary.contents, text])

  if (!state.match) {
    return <span>{text}</span>
  }

  return (
    <>
      <ShowOnly on="desktop" as="span">
        <DesktopView
          description={state.description}
          header={state.header}
          text={text}
        />
      </ShowOnly>
      <ShowOnly on="mobile" as="span">
        <MobileView
          description={state.description}
          header={state.header}
          text={text}
        />
      </ShowOnly>
    </>
  )
}

export default Tooltip
