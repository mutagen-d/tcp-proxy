# Proxy server with tcp tunneling (without multiplexing)

This is a proxy server that tunnels traffic through tcp connections.
It has 2 parts: a local proxy server (handles socks & http) and a remote tcp server (relays traffic).

## Setup

Edit `.env` file with your settings:
```bash
LOCAL_PROXY_PORT - local proxy port (for your machine)
REMOTE_SERVER_URL - remote server url (use http cause handshake data is encrypted)
REMOTE_SERVER_PORT - remote server port
AES_SECRET - secret for aes encryption/decryption (keep it secret)
AES_ALGORITHM - eas algorigtmm (optional)
AES_IV_LENGTH - initialization vector length (optional)
```

## Install

```bash
yarn
```

## Running

### Local machine (your computer)

Run the local proxy server

```bash
yarn local
# or
node src/local.js
# or
pm2 start src/local.js --name proxy-server
```

### Remote machine (server/VPS)

Run the tcp server

```bash
yarn remote
# or
node src/remote.js
# or
pm2 start src/remote.js --name tcp-server
```

## How it works

1. Local proxy runs on your machine
2. Remote tcp server runs on your server
3. They connect through tcp
4. Your traffic goes: App → Local proxy → TCP tunnel → Remote server → Internet
5. Responses come back the same way

## Encryption & Handshake Process

The proxy uses AES encryption only for the initial handshake to establish a secure connection. After handshake completion, all subsequent data is transferred unencrypted through the tunnel.

### Why Only Handshake Encryption?

This design avoids double encryption overhead:
- Most web traffic already uses TLS/SSL (HTTPS)
- Encrypting already-encrypted HTTPS traffic would waste CPU resources
- The handshake encryption ensures secure authentication and connection setup

## Notes

- Make sure both servers are running
- Use http for REMOTE_SERVER_URL (handshake encryption ensures secure setup)
- Check your firewall settings on remote server
- Set the same AES_SECRET on both sides for secure connections
