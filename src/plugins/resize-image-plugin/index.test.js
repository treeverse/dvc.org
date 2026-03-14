const { extractInstructions } = require('.')

describe('extractInstructions', () => {
  it('extracts the title if no instructions are found', () => {
    expect(extractInstructions('I am a title')).toEqual({
      resize: null,
      title: 'I am a title',
      wrap: null
    })
  })

  it('extracts a resize instruction when it finds =NNN', () => {
    expect(extractInstructions('=42 title')).toEqual({
      resize: 42,
      title: 'title',
      wrap: null
    })
  })

  it('extracts a wrap instruction when it finds :wrap-left or :wrap-right', () => {
    expect(extractInstructions(':wrap-left title')).toEqual({
      resize: null,
      title: 'title',
      wrap: 'left'
    })
    expect(extractInstructions(':wrap-right title')).toEqual({
      resize: null,
      title: 'title',
      wrap: 'right'
    })
  })

  it('extracts both wrap instructions and resize instructions', () => {
    expect(extractInstructions('=200 :wrap-right title')).toEqual({
      resize: 200,
      title: 'title',
      wrap: 'right'
    })
  })
})
