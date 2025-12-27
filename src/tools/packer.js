const { unpack, pack } = require('msgpackr')
const { aes } = require('./aes')

const packer = Object.freeze({
  pack: (...args) => {
    const data = pack(args)
    return aes.encode(data)
  },
  /**
   * @param {Buffer} buffer 
   * @returns {any[]}
   */
  unpack: (buffer) => {
    const args = aes.decode(buffer)
    return unpack(args)
  },
})

module.exports = packer
