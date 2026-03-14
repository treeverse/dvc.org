class Slugger {
  separator: string
  lowercase: boolean
  slugs: Array<string>

  constructor(options?: { separator?: string; lowercase?: boolean }) {
    this.separator = options?.separator || '-'
    this.lowercase = options?.lowercase === false ? false : true
    this.slugs = []
  }

  slug(str: string) {
    str = typeof str === 'string' ? str : ''
    let slug = this.slugify(str)

    if (this.lowercase) {
      slug = slug.toLowerCase()
    }
    if (this.slugs.includes(slug)) {
      throw new Error(`Duplicate slug: ${slug}`)
    }
    this.slugs.push(slug)
    return slug
  }
  slugify(str: string) {
    return str
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[-\s]+/g, this.separator)
      .replace(this.separator + this.separator, this.separator)
      .replace(/(^-+|-+$)/g, '')
  }
  reset() {
    this.slugs = []
  }
}
export default Slugger
