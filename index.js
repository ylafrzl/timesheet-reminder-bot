const http = require('http');
const fs = require('fs');

let logMessage = '';

const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const logData = JSON.parse(body);
      logMessage = logData.message;
      res.writeHead(200, { 'Content-Type': 'text /plain' });
      res.end('Log message received!');
    });
  } else {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Log Message</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700&display=swap">
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
 <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f9f9f9;
            }
            .log-message {
              max-width: 600px;
              margin: 40px auto;
              padding: 20px;
              background-color: #fff;
              border: 1px solid #ddd;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .log-message h2 {
              margin-top: 0;
              color: #333;
            }
            .log-message p {
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="log-message">
            <h2>Log Message</h2>
            <p>${logMessage}</p>
          </div>
        </body>
      </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});