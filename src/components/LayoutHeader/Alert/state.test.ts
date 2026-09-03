import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi
} from 'vitest'

import {
  ALERT_DISMISSED_ATTRIBUTE,
  ALERT_DISMISSED_STORAGE_KEY,
  dismissAlert
} from './state'

describe('layout alert state', () => {
  const setItem = vi.fn()

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: { setItem }
    })
  })

  afterEach(() => {
    document.body.removeAttribute(ALERT_DISMISSED_ATTRIBUTE)
    setItem.mockClear()
  })

  afterAll(() => {
    delete (window as { localStorage?: Storage }).localStorage
  })

  it('persists a dismissal and updates the document immediately', () => {
    dismissAlert()

    expect(document.body.hasAttribute(ALERT_DISMISSED_ATTRIBUTE)).toBe(true)
    expect(setItem).toHaveBeenCalledWith(ALERT_DISMISSED_STORAGE_KEY, 'true')
  })
})
