const express = require('express');
const EventEmitter = require('events');
const path = require('path');

const port = process.env.PORT || 3000;

const app = express();

const chatEmitter = new EventEmitter();

// function declarations for respondText, respondJson, respondNotFound
// and respondEcho stay here

function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

function respondJson(req, res) {
  res.json({ text: 'hi', numbers: [1, 2, 3] });
}

function respondNotFound(req, res) {
  res.status(404).json({ error: 'Not found' });
}

function respondEcho(req, res) {
  const input = req.query.input || '';
  res.json({
    normal: input,
    shout: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join('')
  });
}

app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', respondEcho);

// add this line just after we declare the express app
app.use(express.static(__dirname + '/public'));

// register /chat endpoint
app.get('/chat', respondChat);

function respondChat(req, res) {
  const { message } = req.query;
  
  chatEmitter.emit('message', message);
  res.end();
}

// register /sse endpoint
app.get('/sse', respondSSE);

/**
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`); // use res.write to keep the connection open, so the client is listening for new messages
  chatEmitter.on('message', onMessage);
}

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});