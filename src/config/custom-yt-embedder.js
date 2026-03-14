const shouldTransform = url => {
  const { host, pathname, searchParams } = new URL(url)

  return (
    host === 'youtu.be' ||
    (['youtube.com', 'www.youtube.com'].includes(host) &&
      pathname.includes('/watch') &&
      Boolean(searchParams.get('v')))
  )
}

const getTimeValueInSeconds = timeValue => {
  if (Number(timeValue).toString() === timeValue) {
    return timeValue
  }

  const {
    1: hours = '0',
    2: minutes = '0',
    3: seconds = '0'
  } = timeValue.match(/(?:(\d*)h)?(?:(\d*)m)?(?:(\d*)s)?/)

  return String((Number(hours) * 60 + Number(minutes)) * 60 + Number(seconds))
}

const getYouTubeIFrameSrc = urlString => {
  const url = new URL(urlString)
  const id =
    url.host === 'youtu.be' ? url.pathname.slice(1) : url.searchParams.get('v')

  const embedUrl = new URL(
    `https://www.youtube-nocookie.com/embed/${id}?rel=0&amp;&amp;showinfo=0;`
  )

  url.searchParams.forEach((value, name) => {
    if (name === 'v') {
      return
    }

    if (name === 't') {
      embedUrl.searchParams.append('start', getTimeValueInSeconds(value))
    } else {
      embedUrl.searchParams.append(name, value)
    }
  })
  return embedUrl.toString()
}

// all code above taken from gatsby-remark-embedder (https://github.com/MichaelDeBoey/gatsby-remark-embedder)

const name = 'YouTubeCustom'

const getHTML = url => {
  const iframeSrc = getYouTubeIFrameSrc(url)

  return `<div class="yt-embed-wrapper"><iframe width="100%" height="315" src="${iframeSrc}" frameBorder="0" allow="autoplay; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowFullScreen></iframe><div className="yt-embed-wrapper__overlay"><span class="yt-embed-wrapper__tooltip">By clicking play, you agree to YouTube&apos;s <a href="https://policies.google.com/u/3/privacy?hl=en" target="_blank" rel="nofollow noopener noreferrer">Privacy Policy</a> and <a href="https://www.youtube.com/static?template=terms" target="_blank" rel="nofollow noopener noreferrer">Terms of Service</a></span></div></div>`
}

export default { getHTML, name, shouldTransform }
