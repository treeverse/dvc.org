module.exports = tag =>
  tag.trim().toLowerCase().replace(/\s/g, '-').replace(/-+/g, '-')
