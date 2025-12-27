const net = require('net')
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
  sock.on('error', (error) => {
    console.log(time(), 'error', ip, error)
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
})
server.listen(port, '0.0.0.0', () => console.log(time(), 'server listening port', port))
