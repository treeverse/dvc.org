import { describe, it, expect, vi, beforeEach } from 'vitest'

const SIDEBAR_SOURCE = '../../../content/docs/sidebar.json'

describe('normalizeSidebar', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  describe('default', () => {
    it('Resolves shortcuts to full syntax', async () => {
      const rawData = ['item-name']
      const result = [
        {
          label: 'Item Name',
          path: '/item-name',
          source: '/docs/item-name.md',
          tutorials: {},
          prev: undefined,
          next: undefined
        }
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { structure: sidebarData } = await import('./sidebar.js')

      expect(sidebarData).toEqual(result)
    })

    it('Adds missed source and label fields', async () => {
      const rawData = [{ slug: 'item-name' }]
      const result = [
        {
          label: 'Item Name',
          path: '/item-name',
          source: '/docs/item-name.md',
          tutorials: {},
          prev: undefined,
          next: undefined
        }
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { structure: sidebarData } = await import('./sidebar.js')

      expect(sidebarData).toEqual(result)
    })

    it('Adds missed source field', async () => {
      const rawData = [{ slug: 'item-name', label: 'Custom Label' }]
      const result = [
        {
          label: 'Custom Label',
          path: '/item-name',
          source: '/docs/item-name.md',
          tutorials: {},
          prev: undefined,
          next: undefined
        }
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { structure: sidebarData } = await import('./sidebar.js')

      expect(sidebarData).toEqual(result)
    })

    it('Adds missed label field', async () => {
      const rawData = [{ slug: 'item-name', source: 'item-name/index.md' }]
      const result = [
        {
          label: 'Item Name',
          path: '/item-name',
          source: '/docs/item-name/index.md',
          tutorials: {},
          prev: undefined,
          next: undefined
        }
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { structure: sidebarData } = await import('./sidebar.js')

      expect(sidebarData).toEqual(result)
    })

    it('Forwards tutorials', async () => {
      const rawData = [
        {
          slug: 'item-name',
          tutorials: {
            katacoda: 'https://www.katacoda.com/dvc/courses/get-started'
          }
        }
      ]
      const result = [
        {
          label: 'Item Name',
          path: '/item-name',
          source: '/docs/item-name.md',
          tutorials: {
            katacoda: 'https://www.katacoda.com/dvc/courses/get-started'
          },
          prev: undefined,
          next: undefined
        }
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { structure: sidebarData } = await import('./sidebar.js')

      expect(sidebarData).toEqual(result)
    })

    it('Resolves multiple nested levels', async () => {
      const rawData = [
        {
          slug: 'item-name',
          children: [{ slug: 'nested-item', children: ['subnested-item'] }]
        }
      ]
      const result = [
        {
          label: 'Item Name',
          path: '/item-name',
          source: '/docs/item-name.md',
          tutorials: {},
          prev: undefined,
          next: '/item-name/nested-item',
          children: [
            {
              label: 'Nested Item',
              path: '/item-name/nested-item',
              source: '/docs/item-name/nested-item.md',
              tutorials: {},
              prev: '/item-name',
              next: '/item-name/nested-item/subnested-item',
              children: [
                {
                  label: 'Subnested Item',
                  path: '/item-name/nested-item/subnested-item',
                  source: '/docs/item-name/nested-item/subnested-item.md',
                  tutorials: {},
                  prev: '/item-name/nested-item',
                  next: undefined
                }
              ]
            }
          ]
        }
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { structure: sidebarData } = await import('./sidebar.js')

      expect(sidebarData).toEqual(result)
    })

    it('Adds correct prev/next links in nested lists', async () => {
      const rawData = [
        {
          slug: 'first-item',
          children: [
            'nested-item-first',
            {
              slug: 'nested-item-second',
              source: 'nested-item-second/index.md',
              children: ['nested-nested-item']
            }
          ]
        },
        'second-item'
      ]

      const result = [
        {
          path: '/first-item',
          source: '/docs/first-item.md',
          label: 'First Item',
          tutorials: {},
          prev: undefined,
          next: '/first-item/nested-item-first',
          style: undefined,
          icon: undefined,
          children: [
            {
              path: '/first-item/nested-item-first',
              source: '/docs/first-item/nested-item-first.md',
              label: 'Nested Item First',
              tutorials: {},
              prev: '/first-item',
              next: '/first-item/nested-item-second',
              style: undefined,
              icon: undefined
            },
            {
              path: '/first-item/nested-item-second',
              source: '/docs/first-item/nested-item-second/index.md',
              label: 'Nested Item Second',
              tutorials: {},
              prev: '/first-item/nested-item-first',
              next: '/first-item/nested-item-second/nested-nested-item',
              style: undefined,
              icon: undefined,
              children: [
                {
                  path: '/first-item/nested-item-second/nested-nested-item',
                  source:
                    '/docs/first-item/nested-item-second/nested-nested-item.md',
                  label: 'Nested Nested Item',
                  tutorials: {},
                  prev: '/first-item/nested-item-second',
                  next: '/second-item',
                  style: undefined,
                  icon: undefined
                }
              ]
            }
          ]
        },
        {
          path: '/second-item',
          source: '/docs/second-item.md',
          label: 'Second Item',
          tutorials: {},
          prev: '/first-item/nested-item-second/nested-nested-item',
          next: undefined,
          style: undefined,
          icon: undefined
        }
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { structure: sidebarData } = await import('./sidebar.js')

      expect(sidebarData).toEqual(result)
    })

    it('Adds correct prev/next links for sourceless items', async () => {
      const rawData = [
        'first-item',
        { slug: 'second-item', source: false, children: ['nested-item'] }
      ]
      const result = [
        {
          label: 'First Item',
          path: '/first-item',
          source: '/docs/first-item.md',
          tutorials: {},
          prev: undefined,
          next: '/second-item'
        },
        {
          label: 'Second Item',
          path: '/second-item',
          source: false,
          tutorials: {},
          prev: '/first-item',
          next: '/second-item/nested-item',
          children: [
            {
              label: 'Nested Item',
              path: '/second-item/nested-item',
              source: '/docs/second-item/nested-item.md',
              tutorials: {},
              prev: '/first-item',
              next: undefined
            }
          ]
        }
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { structure: sidebarData } = await import('./sidebar.js')

      expect(sidebarData).toEqual(result)
    })

    it('Adds correct prev/next links for nested sourceless items', async () => {
      const rawData = [
        'first-item',
        {
          slug: 'second-item',
          source: false,
          children: [
            { slug: 'nested-item', source: false, children: ['subnested-item'] }
          ]
        }
      ]
      const result = [
        {
          label: 'First Item',
          path: '/first-item',
          source: '/docs/first-item.md',
          tutorials: {},
          prev: undefined,
          next: '/second-item'
        },
        {
          label: 'Second Item',
          path: '/second-item',
          source: false,
          tutorials: {},
          prev: '/first-item',
          next: '/second-item/nested-item',
          children: [
            {
              label: 'Nested Item',
              path: '/second-item/nested-item',
              source: false,
              tutorials: {},
              prev: '/first-item',
              next: '/second-item/nested-item/subnested-item',
              children: [
                {
                  label: 'Subnested Item',
                  path: '/second-item/nested-item/subnested-item',
                  source: '/docs/second-item/nested-item/subnested-item.md',
                  tutorials: {},
                  prev: '/first-item',
                  next: undefined
                }
              ]
            }
          ]
        }
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { structure: sidebarData } = await import('./sidebar.js')

      expect(sidebarData).toEqual(result)
    })

    it("Throws error if external item doesn't have a url field", async () => {
      const rawData = [{ type: 'external' }]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))

      await expect(() => import('./sidebar.js')).rejects.toThrow(
        new Error("'url' field is required in external sidebar.json entries")
      )
    })

    it("Throws error if local item doesn't have slug field", async () => {
      const rawData = [{}]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))

      await expect(() => import('./sidebar.js')).rejects.toThrow(
        new Error("'slug' field is required in local sidebar.json entries")
      )
    })

    it("Throws error if item has source: false and doesn't have children", async () => {
      const rawData = [{ slug: 'item-name', source: false }]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))

      await expect(() => import('./sidebar.js')).rejects.toThrow(
        new Error(
          'Local sidebar.json entries with no source must have children'
        )
      )
    })
  })

  describe('getItemByPath', () => {
    it('Returns first child for the /doc path', async () => {
      const rawData = ['item-name']
      const result = {
        label: 'Item Name',
        path: '/item-name',
        source: '/docs/item-name.md',
        tutorials: {},
        prev: undefined,
        next: undefined
      }

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { getItemByPath } = await import('./sidebar.js')

      expect(getItemByPath('/')).toEqual(result)
    })

    it('Returns first child with source for all parents with source:false', async () => {
      const rawData = [
        {
          slug: 'item',
          source: false,
          children: [
            {
              slug: 'nested',
              source: false,
              children: [
                {
                  slug: 'subnested',
                  source: false,
                  children: ['leaf-item']
                }
              ]
            }
          ]
        }
      ]
      const result = {
        label: 'Leaf Item',
        path: '/item/nested/subnested/leaf-item',
        source: '/docs/item/nested/subnested/leaf-item.md',
        tutorials: {},
        prev: undefined,
        next: undefined
      }

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { getItemByPath } = await import('./sidebar.js')

      expect(getItemByPath('/item')).toEqual(result)
      expect(getItemByPath('/item/nested')).toEqual(result)
      expect(getItemByPath('/item/nested/subnested')).toEqual(result)
    })
  })

  describe('getParentsListFromPath', () => {
    it("Returns array of current and parent's paths", async () => {
      const rawData = []
      const path = '/item-name/nested-item/subnested-item'
      const result = [
        '/item-name',
        '/item-name/nested-item',
        '/item-name/nested-item/subnested-item'
      ]

      vi.doMock(SIDEBAR_SOURCE, () => ({ default: rawData }))
      const { getParentsListFromPath } = await import('./sidebar.js')

      expect(getParentsListFromPath(path)).toEqual(result)
    })
  })
})
