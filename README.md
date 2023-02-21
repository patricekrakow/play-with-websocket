# Let's Play with WebSocket (WS)

> **_Note:_** This repository has an Server-Sent Events (SSE) companion, available at <https://github.com/patricekrakow/play-with-server-sent-events>, showing the exact same example implemented with SSE instead of WS :-)

## Abstract

This repository contains the **simplest** running example illustrating how WebSocket (WS) works :-) If you have an idea for an even simpler example, please let me know!

A server (written in Node.js) **pushes** a random integer between 0 and 99 generated every 2 seconds to all connected clients.

## Server Implementation

The random integer between 0 and 99 is generated using

```javascript
const random = Math.floor(Math.random() * 100)
```

The server generates a new random integer every 2 seconds using _timing events_ as follow

```javascript
setInterval(generateRandom, 2000)

function generateRandom() {

}
```

The server accepts WebSocket connection on port `8090` using

```javascript
const WebSocket = require('ws')
const uuid = require('uuid')

const port = 8090

const wss = new WebSocket.Server({ port: port })

wss.on('connection', function connection(ws) {
  ws.id = uuid.v4()
  ws.on('message', function incoming(message) {
    console.log(`[INFO] Received form WS: ${message}`)
  })
})
```

The code above requires the installation of the `ws` and `uuid` packages

```text
npm install --save ws
npm install --save uuid
```

The following part of the code above

```javascript
ws.on('message', function incoming(message) {
  console.log(`[INFO] Received form WS: ${message}`)
})
```

is not really necessary as our client will not send any messages to the server, but we decided to keep it to keep our code quite general; we should not forget that WebSocket allows communication in **both** directions once the connection is established (by the client).

Finally, within the `generateRandom` function, the generated random integer is sent to all connected clients using

```javascript
function generateRandom() {
  const random = Math.floor(Math.random() * 100) // An integer between 0 and 99.
  console.log(`[INFO] Random integer (0..99) generated: ${random}`)

  wss.clients.forEach(function(client) {
    console.log(`[INFO]   Sending to: ${client.id}`)
    client.send(JSON.stringify({ random: random }))
  })
}
```

You can see that we are sending the random integer within a simple JSON structure

```json
{
  "random": 95
}
```

that will need to parsed client-side.

You can run the server using

```text
node server/app.js
```

## Client Implementation

We will use a super simple `index.html` HTML page with the following skeleton:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Random</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0">
    <style>

    </style>
  </head>
  <body>
    <table>
      <tr>
        <td id="text">Hello!</td>
      </tr>
    </table>
    <p id="info">...</p>
    <script>

    </script>
  </body>
</html>
```

The random integer will shown within the `<td>` element with the `id="text"` overwriting the `Hello!` text. There is also a `<p>` element with the `id="info"` in which we will show the address of the WebSocker server.

There is a simple embedded CSS in order to make things nicer, according to my limited knowledge of CSS :-) And, I will not dare to explain this CSS; if you can simplify it and/or make it more clear, do not hesitate!

We will serve the `index.html` file with `http-server` that can be installed using

```text
npm install -g http-server
```

and we will use the port `8080`

```text
http-server www --port 8080
```

The address of the WebSocket will constructed within the `index.html` using

```javascript
const wsPort = 8090
const url = `ws://${location.hostname}:${wsPort}`
```

Then, the connection with the WebSocket (WS) server is established using

```javascript
const socket = new WebSocket(url)
```

When connected the `<td>` element with the `id="text"` is overwritten with

```javascript
socket.onmessage = function(event) {
  const value = JSON.parse(event.data).random
  text.innerHTML = value
}
```

where our simple JSON structure is parsed

```json
{
  "random": 95
}
```

Finally, we found useful to handle the situation when the WebSocket is not running using

```javascript
socket.onerror = function(event){
  text.innerHTML = "Refresh!"
}
```

After having started the WebScoket server on port `8080` and the HTTP server on port `8082`, you can have a try with one or multiple browsers going to

```text
http://<Your IP address>:8080
```

## Server Logs

Please find below an example of the WebSocker server `server/app.js` where after a first client `c32cc32d-696c-41a1-b0b1-69c34ea29ae8` has connected, a second one `b06c374a-92a3-4a0d-b696-7acf6ca13b70` is joining

```text
...
[INFO] Random integer (0..99) generated: 30
[INFO]   Sending to: c32cc32d-696c-41a1-b0b1-69c34ea29ae8
[INFO] Random integer (0..99) generated: 54
[INFO]   Sending to: c32cc32d-696c-41a1-b0b1-69c34ea29ae8
[INFO] Random integer (0..99) generated: 56
[INFO]   Sending to: c32cc32d-696c-41a1-b0b1-69c34ea29ae8
[INFO] Random integer (0..99) generated: 76
[INFO]   Sending to: c32cc32d-696c-41a1-b0b1-69c34ea29ae8
[INFO]   Sending to: b06c374a-92a3-4a0d-b696-7acf6ca13b70
[INFO] Random integer (0..99) generated: 24
[INFO]   Sending to: c32cc32d-696c-41a1-b0b1-69c34ea29ae8
[INFO]   Sending to: b06c374a-92a3-4a0d-b696-7acf6ca13b70
...
```
