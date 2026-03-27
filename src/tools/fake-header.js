const crypto = require('crypto')
const config = require('../config')
const { randomUrl } = require('./random-url')
const { randomMethod } = require('./random-method')

const LF = '\n'.charCodeAt(0)
const CR = '\r'.charCodeAt(0)
const SEP = '\r\n'

const getHost = () => {
  const regex = /^https?\:\/\/([^:/]+)/
  const match = config.remoteUrl.match(regex)
  return match && match[1]
}
const HOST = getHost() || 'example.com';

/**
 * @param {{
 *  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'HEAD'
 *  contentLength?: number | string
 *  userAgent?: string
 * }} [opts]
 */
const REQUEST_HEADERS = (opts) => {
  opts = opts || {}
  const method = opts.method || randomMethod()
  const userAgent = opts.userAgent || 'curl/7.81.0'
  const headers = [
    `${method} ${randomUrl()} HTTP/1.1`,
    `Host: ${HOST}`,
    `User-Agent: ${userAgent}`,
    'Content-Type: octet/stream',
    'Accept: */*',
  ]
  if (opts.contentLength) {
    headers.push(`Content-Length: ${opts.contentLength}`)
  }
  headers.push(SEP)
  return headers
}
const html = `<!DOCTYPE html>
<html>
  <head>
    <title>Unauthorized</title>
  </head>
  <body>
    <h1>401 Unauthorized</h1>
  </body>
</html>`
const RESPONSE = [
  'HTTP/1.1 401 Unauthorized',
  'Content-Type: text/html',
  `Content-Length: ${html.length}`,
  '',
  html,
]
const RESPONSE_BUFFER = Buffer.from(RESPONSE.join(SEP))
const fakeHeader = {
  /**
   * @param {Buffer} data 
   */
  serialize: (data) => {
    const headers = REQUEST_HEADERS({ contentLength: data.byteLength })
    return Buffer.concat([Buffer.from(headers.join(SEP), 'utf-8'), data])
  },
  /**
   * @param {Buffer} data 
   */
  parse: (data) => {
    const index = fakeHeader.findHeaderEnd(data)
    // console.log('data: ', index, data.byteLength, data.toString('utf-8'))
    if (index >= 0) {
      return data.subarray(index)
    }
    return data
  },
  /**
   * @param {Buffer} data 
   */
  findHeaderEnd: (data) => {
    for (let i = 0; i < data.byteLength; ++i) {
      if (data[i] === LF && data[i + 1] === LF) {
        return i + 2
      }
      if (data[i] === LF && data[i + 1] === CR && data[i + 2] === LF) {
        return i + 3
      }
    }
    return -1
  },
  response: () => {
    return RESPONSE_BUFFER
  }
}

module.exports = { fakeHeader }