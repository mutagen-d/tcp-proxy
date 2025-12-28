require('dotenv').config()

const config = {
  secret: process.env.AES_SECRET,
  algorithm: process.env.AES_ALGORITHM || 'aes-256-gcm',
  ivLength: +(process.env.AES_IV_LENGTH || 16),
  localPort: +(process.env.LOCAL_PROXY_PORT || 8025),
  remoteUrl: process.env.REMOTE_SERVER_URL || 'http://localhost:8015',
  remotePort: +(process.env.REMOTE_SERVER_PORT || 8015),
  multiplex: process.env.MULTIPLEX === 'true',
}

if (!config.secret) {
  throw new Error('AES_SECRET required in .env')
}

module.exports = config
