declare module '*.png' {
  type IPNG = string

  const png: IPNG
  export = png
}

declare module '*.css' {
  interface IClassNames {
    [className: string]: string
  }
  const classNames: IClassNames
  export = classNames
}

declare module '*.svg' {
  export const ReactComponent: React.FC<React.SVGAttributes<SVGElement>>
  const filePath: string
  export default filePath
}

declare module '*.mp4' {
  const src: string
  export default src
}

declare module 'iso-url' {
  export const URL: typeof window.URL
}

declare module 'reset-css'
