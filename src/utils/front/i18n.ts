export function pluralize(
  entry: { zero: string; one: string; other: string },
  count: number
): string {
  let selectedEntry

  if (count === 0 && entry.zero) {
    selectedEntry = entry.zero
  } else if (count === 1) {
    selectedEntry = entry.one
  } else {
    selectedEntry = entry.other
  }

  return selectedEntry.replace('{count}', count.toString())
}

export function pluralizeComments(count: number): string {
  return pluralize(
    { zero: 'No comments', one: '{count} comment', other: '{count} comments' },
    count
  )
}
