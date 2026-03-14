import { useEffect } from 'react'

import safeLocalStorage from './safeLocalStorage'

const hideAllEmbedOverlays = (embeds: NodeListOf<Element>) => {
  embeds.forEach(embed => {
    const overlay = embed.querySelector('.yt-embed-wrapper__overlay')
    overlay?.classList.add('hidden')
  })
}

const setUpEmbedClickListeners = (embeds: NodeListOf<Element>) => {
  const removeClickListeners: Array<() => void> = []

  embeds.forEach(embed => {
    const iframe = embed.querySelector('iframe')
    const overlay = embed.querySelector('.yt-embed-wrapper__overlay')
    const tooltip = embed.querySelector('.yt-embed-wrapper__tooltip')

    const handleOverlayClick = (event: MouseEvent) => {
      if (event.target === tooltip || tooltip?.contains(event.target as Node)) {
        return
      }

      if (iframe && iframe.src) {
        iframe.src = iframe?.src + `&autoplay=1`
      }
      hideAllEmbedOverlays(embeds)
      safeLocalStorage.setItem('yt-embed-consent', 'true')
    }
    const removeListener = () => {
      overlay?.removeEventListener('click', handleOverlayClick as EventListener)
    }
    overlay?.addEventListener('click', handleOverlayClick as EventListener)
    removeClickListeners.push(removeListener)
  })

  return () => {
    removeClickListeners.forEach(rmListener => rmListener())
  }
}

const useCustomYtEmbeds = () => {
  useEffect(() => {
    const hasUserGivenConsent = Boolean(
      safeLocalStorage.getItem('yt-embed-consent')
    )
    const embeds = document.querySelectorAll('.yt-embed-wrapper')

    if (hasUserGivenConsent) {
      hideAllEmbedOverlays(embeds)
      return
    }

    const cleanUpEventListeners = setUpEmbedClickListeners(embeds)

    return () => {
      cleanUpEventListeners()
    }
  }, [])
}

export default useCustomYtEmbeds
