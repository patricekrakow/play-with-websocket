// play-with-websocket/app.js
const WebSocket = require('ws')
const uuid = require('uuid')

const wss = new WebSocket.Server({ port: 8080 })

setInterval(generateRandom, 2000)

function generateRandom() {
  const random = Math.floor(Math.random() * 100) // An integer between 0 and 99.
  console.log(`[INFO] Random integer (0..99) generated: ${random}`)

  wss.clients.forEach(function(client) {
    console.log(`[INFO]   Sending to: ${client.id}`)
    client.send(JSON.stringify({ random: random }))
  })
}

wss.on('connection', function connection(ws) {
  ws.id = uuid.v4()
  ws.on('message', function incoming(message) {
    console.log(`[INFO] Received form WS: ${message}`)
  })
})
