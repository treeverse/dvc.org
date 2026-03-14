import cn from 'classnames'
import { nanoid } from 'nanoid'
import {
  createContext,
  FC,
  Fragment,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'

import * as styles from './styles.module.css'

interface ITogglesData {
  [key: string]: {
    texts: string[]
    checkedInd: number
    parentText: string | null
  }
}

interface ITogglesContext {
  addNewToggle?: (
    id: string,
    texts: string[],
    parentText: string | null
  ) => void
  updateToggleInd?: (id: string, newInd: number) => void
  togglesData?: ITogglesData
}

export const TogglesContext = createContext<ITogglesContext>({})

const makeTextUrlFriendly = (val: string): string =>
  val.replace(/[^\w\-._~]/g, '-').replace(/-+/g, '-')

const convertTabTextToQueryText = (
  text: string,
  parentText: string | null
): string => makeTextUrlFriendly(`${parentText ? `${parentText} ` : ''}${text}`)

const getUrlQueryVal = (query: string, param: string): string => {
  const params = new URLSearchParams(query)
  return params.get(param) || ''
}

const setUrlQuery = (href: string, param: string, value: string): void => {
  const formattedVal = makeTextUrlFriendly(value)
  const url = new URL(href)
  url.searchParams.set(param, formattedVal)
  window.history.pushState({}, '', url.href)
}

const getSelectedIndexBasedOffQueryVal = (
  texts: string[],
  queryVal: string,
  parentText: string | null
): number => {
  const urlFriendlyTexts = texts.map(text =>
    convertTabTextToQueryText(text, parentText)
  )
  const index = urlFriendlyTexts.findIndex(text => queryVal.startsWith(text))
  return index > -1 ? index : 0
}

export const TogglesProvider: React.FC<
  PropsWithChildren<Record<never, never>>
> = ({ children }) => {
  const [togglesData, setTogglesData] = useState({})
  const [lastSelectedTab, setLastSelectedTab] = useState<null | string>(null)

  useEffect(() => {
    const tab = getUrlQueryVal(window.location.search, 'tab')
    setLastSelectedTab(tab)
  }, [])

  const addNewToggle = (
    id: string,
    texts: string[],
    parentText: string | null
  ): void => {
    let lastSelected = lastSelectedTab
    const togglesDataCopy: ITogglesData = { ...togglesData }

    if (lastSelected === null) {
      lastSelected = getUrlQueryVal(window.location.search, 'tab')
    }

    togglesDataCopy[id] = {
      texts,
      checkedInd: getSelectedIndexBasedOffQueryVal(
        texts,
        lastSelected,
        parentText
      ),
      parentText
    }
    setTogglesData(togglesDataCopy)
  }

  const updateToggleInd = (id: string, newInd: number): void => {
    const togglesDataCopy: ITogglesData = { ...togglesData }
    const selectedTabText = togglesDataCopy[id].texts[newInd]

    for (const [key, value] of Object.entries(togglesDataCopy)) {
      if (key === id) {
        togglesDataCopy[id].checkedInd = newInd
        continue
      }
      const index = value.texts.indexOf(selectedTabText)
      if (index !== -1) {
        togglesDataCopy[key].checkedInd = index
      }
    }

    setUrlQuery(
      window.location.href,
      'tab',
      convertTabTextToQueryText(selectedTabText, togglesDataCopy[id].parentText)
    )
    setLastSelectedTab(selectedTabText)
    setTogglesData(togglesDataCopy)
  }

  return (
    <TogglesContext.Provider
      value={{ addNewToggle, updateToggleInd, togglesData }}
    >
      {children}
    </TogglesContext.Provider>
  )
}

const ToggleTab: React.FC<
  PropsWithChildren<{
    id: string
    title: string
    ind: number
    onChange: () => void
    checked: boolean
  }>
> = ({ children, id, checked, ind, onChange, title }) => {
  const inputId = `tab-${id}-${ind}`

  return (
    <>
      <input
        id={inputId}
        type="radio"
        name={`toggle-${id}`}
        onChange={onChange}
        checked={checked}
      />
      <label className={styles.tabHeading} htmlFor={inputId}>
        {title}
      </label>
      {children}
    </>
  )
}

export const Toggle: React.FC<{
  height?: string
  children: Array<{ props: { title: string } } | string>
}> = ({ height, children }) => {
  const [toggleId, setToggleId] = useState('')
  const {
    addNewToggle = (): null => null,
    updateToggleInd = (): null => null,
    togglesData = {}
  } = useContext(TogglesContext)
  const tabs: Array<{ props: { title: string } } | string> = children.filter(
    child => child !== '\n'
  )
  const tabsTitles = tabs.map(tab =>
    typeof tab === 'object' ? tab.props.title : ''
  )
  const toggleEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tabParent =
      toggleEl.current && toggleEl.current.closest('.toggle .tab')
    const labelParentText =
      tabParent &&
      tabParent.previousElementSibling &&
      tabParent.previousElementSibling.textContent

    if (toggleId === '') {
      const newId = nanoid()
      addNewToggle(newId, tabsTitles, labelParentText)
      setToggleId(newId)
    }

    if (toggleId && !togglesData[toggleId]) {
      addNewToggle(toggleId, tabsTitles, labelParentText)
    }
  }, [addNewToggle, tabsTitles, toggleId, togglesData])

  return (
    <div className={cn('toggle', styles.toggle)} ref={toggleEl}>
      {tabs.map((tab, i) => (
        <ToggleTab
          ind={i}
          key={i}
          title={tabsTitles[i]}
          id={toggleId}
          checked={
            i === (togglesData[toggleId] ? togglesData[toggleId].checkedInd : 0)
          }
          onChange={(): void => updateToggleInd(toggleId, i)}
        >
          <div
            className={cn('tab', styles.tab)}
            style={{
              minHeight: height
            }}
          >
            {tab as string}
          </div>
        </ToggleTab>
      ))}
    </div>
  )
}

export const Tab: FC<PropsWithChildren<Record<never, never>>> = ({
  children
}) => {
  return <Fragment>{children}</Fragment>
}
