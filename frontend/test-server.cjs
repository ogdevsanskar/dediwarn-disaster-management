const http = require('http');
const port = 5175;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Server</title>
    </head>
    <body>
      <h1>Test Server Running</h1>
      <p>If you can see this, the server is working.</p>
      <script>
        fetch('http://localhost:5174/')
          .then(response => response.text())
          .then(data => {
            console.log('Vite server response length:', data.length);
            document.body.innerHTML += '<p>Vite server responded with ' + data.length + ' characters</p>';
          })
          .catch(error => {
            console.error('Error connecting to Vite server:', error);
            document.body.innerHTML += '<p style="color: red;">Error connecting to Vite server: ' + error.message + '</p>';
          });
      </script>
    </body>
    </html>
  `);
});

server.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}/`);
});
