const crypto = require('crypto')

const randomUrl = () => {
  const size = Math.floor(Math.random() * 10) + 5;
  const id = crypto.randomBytes(size).toString('hex')
  /** @type {['images', 'videos', 'users']} */
  const names = [
    'images',
    'videos',
    'users',
  ]
  const index = crypto.randomInt(names.length)
  const name = names[index]
  if (crypto.randomInt(10) < 5) {
    /** @type {`/api/${name}/${id}`} */
    const url = `/api/${name}/${id}`
    return url
  }
  /** @type {`/api/${name}`} */
  const url = `/api/${name}`
  return url
}

module.exports = { randomUrl }
