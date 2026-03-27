const net = require('net')
const config = require('./config');
const { SocketBase } = require('./tools/socket-base');
const { fakeHeader } = require('./tools/fake-header');
const { EncryptedStream } = require('./tools/encrypted-stream');
const { aes } = require('./tools/aes');

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
  socket.on('error', (error) => {
    console.log(time(), 'ERROR(0)', socket._url || '', ip, error)
  })
  const sock = new SocketBase(socket)
  sock.connected = true;
  sock.on('error', (error) => {
    console.log(time(), 'ERROR(1)', socket._url || '', ip, error)
    socket.end(fakeHeader.response(), 'utf-8')
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
    const stream = new EncryptedStream(sock.socket, {
      encode: aes.encode,
      decode: aes.decode,
      encrypted: true,
    })
    s.pipe(stream).pipe(s)
  })
})
server.listen(port, '0.0.0.0', () => console.log(time(), 'server listening port', port))
server.on('error', (err) => console.log(time(), 'server error', err))
