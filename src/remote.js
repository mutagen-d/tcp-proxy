const net = require('net')
const ss = require('socket.io-stream')
const config = require('./config');
const { SocketBase } = require('./tools/socket-base');

const port = config.remotePort;
const time = () => new Date().toISOString()

const server = net.createServer()
server.on('connection', (socket) => {
  const ip = socket.remoteAddress;
  socket.setTimeout(30_000, () => socket.destroy())
  console.log(time(), 'CONNECT', ip)
  socket.on('close', () => {
    console.log(time(), 'DISCONNECT', socket._url || '', ip)
  })
  const sock = new SocketBase(socket)
  sock.connected = true;
  ss(sock).on('error', (error) => {
    console.log(time(), 'ERROR', socket._url || '', ip, error)
  })
  ss(sock).once('multiplex', () => {
    socket._url = '(multiplex)'
  })
  sock.on('proxy-stream', (options, callback) => {
    sock.detach()
    const url = `${options.dstHost}:${options.dstPort}`
    socket._url = url;
    console.log(time(), url, ip)
    const s = net.createConnection({ host: options.dstHost, port: options.dstPort })
    s.on('connect', () => callback())
    s.on('error', (error) => {
      callback(error && (error.message || error))
    })
    s.pipe(sock.socket).pipe(s)
  })
  ss(sock).on('proxy-stream', (options, stream, callback) => {
    socket._url = '(multiplex)'
    const url = `${options.dstHost}:${options.dstPort}`
    const start = Date.now()
    console.log(time(), url, ip)
    const s = net.createConnection({ host: options.dstHost, port: options.dstPort })
    s.on('connect', () => callback())
    s.on('error', (error) => {
      callback(error && (error.message || error))
    })
    s.pipe(stream).pipe(s)
    stream.on('end', () => {
      const duration = Date.now() - start
      console.log(time(), url, ip, `+${duration}ms`, '(multiplex)')
    })
  })
})
server.on('error', (error) => {
  console.log(time(), 'Warning!', error)
})
server.listen(port, '0.0.0.0', () => console.log(time(), 'server listening port', port))
