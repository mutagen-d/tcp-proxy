require('dotenv').config()
const { createProxyServer } = require('@mutagen-d/node-proxy-server')
const { Defer } = require('./tools/defer');
const config = require('./config');
const { SocketBase } = require('./tools/socket-base');

const port = config.localPort;
const time = () => new Date().toISOString();
const url = new URL(config.remoteUrl)
const remote = {
  host: url.hostname,
  port: url.port,
}
const server = createProxyServer({
  createProxyConnection: async (options) => {
    const timestamp = Date.now()
    options.timestamp = timestamp
    const defer = new Defer()
    const socket = new SocketBase({ host: remote.host, port: remote.port })
    socket.once('connect', () => {
      socket.emit('proxy-stream', options, (err) => {
        err ? defer.reject(err) : defer.resolve()
      })
    })
    await defer.promise
    console.log(time(), `${options.dstHost}:${options.dstPort} +${Date.now() - timestamp}ms`)
    socket.detach()
    return socket.socket;
  }
})

server.on('error', (error) => {
  console.log(time(), 'error', error)
})

server.listen(port, '0.0.0.0', () => console.log(time(), 'server listening port', port))