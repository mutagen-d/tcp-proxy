const crypto = require('crypto')

const randomMethod = () => {
  /** @type {['GET', 'POST', 'PUT', 'PATCH']} */
  const methods = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
  ]
  const index = crypto.randomInt(methods.length)
  const method = methods[index]
  return method
}

module.exports = { randomMethod }
