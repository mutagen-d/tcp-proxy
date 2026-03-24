const { unpack, pack } = require('msgpackr')
const { aes } = require('./aes')
const { fakeHeader } = require('./fake-header')

const packer = Object.freeze({
  pack: (...args) => {
    // console.log(`packing (args = ${args.map(v => JSON.stringify(v))})`)
    const data = pack(args)
    // console.log(`packed (bytes = ${data.byteLength})`)
    const res = fakeHeader.serialize(aes.encode(data))
    // const res = aes.encode(data)
    // console.log(`encoded (bytes = ${res.byteLength}, data = ${res})`)
    return res
  },
  /**
   * @param {Buffer} buffer 
   * @returns {any[]}
   */
  unpack: (buffer) => {
    // console.log(`decoding (bytes = ${buffer.byteLength}, data = ${buffer})`)
    const args = aes.decode(fakeHeader.parse(buffer))
    // const args = aes.decode(buffer)
    // console.log(`upacking (bytes = ${args.byteLength})`)
    const res = unpack(args)
    // console.log(`upacked (args = ${res.map(v => JSON.stringify(v))})`)
    return res
  },
})

module.exports = packer
