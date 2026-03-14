declare global {
  interface Window {
    plausible: (
      eventName: string,
      props?: { props: { [key: string]: string } }
    ) => void
  }
}

export const logEvent = (
  eventName: string,
  props?: { [key: string]: string }
): void => {
  if (!window.plausible) return
  if (props) {
    window.plausible(eventName, { props })
  } else {
    window.plausible(eventName)
  }
}
