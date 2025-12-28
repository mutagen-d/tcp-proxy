require('dotenv').config()
const { createProxyServer } = require('@mutagen-d/node-proxy-server')
const ss = require('socket.io-stream')
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

const mSocket = new SocketBase({ host: remote.host, port: remote.port })
mSocket.reconnectTimeout = 3000;
ss(mSocket).on('error', (error) => {
  console.log(time(), '(multiplex) ERROR', error)
})
mSocket.once('connect', () => {
  ss(mSocket).emit('multiplex')
})
mSocket.on('connect', () => {
  console.log(time(), '(multiplex) CONNECT', config.remoteUrl)
})
mSocket.on('disconnect', () => {
  console.log(time(), '(multiplex) DISCONNECT', config.remoteUrl)
})

const server = createProxyServer({
  createProxyConnection: async (options) => {
    const timestamp = Date.now()
    options.timestamp = timestamp
    if (config.multiplex) {
      const defer = new Defer()
      const stream = ss.createStream()
      ss(mSocket).emit('proxy-stream', options, stream, (err) => {
        err ? defer.reject(err) : defer.resolve()
      })
      await defer.promise
      console.log(time(), `${options.dstHost}:${options.dstPort} +${Date.now() - timestamp}ms`)
      return stream
    }
    const defer = new Defer()
    const socket = new SocketBase({ host: remote.host, port: remote.port })
    socket.once('connect', () => {
      socket.emit('proxy-stream', options, (err) => {
        err ? defer.reject(err) : defer.resolve()
      })
    })
    socket.on('error', (error) => {
      console.log(time(), 'Warning!', error)
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