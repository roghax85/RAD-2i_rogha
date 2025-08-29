// backend.js
const express = require('express');
const fs = require('fs');
const os = require('os');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use((req, res, next) => {
  // Permitir CORS para desarrollo local
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Usuarios permitidos (usuario: contraseña)
const users = {
  rogha: '999',
  userHN: '40hSx3g8',
  userCR: '5ThpNc2Y'
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (users[username] && users[username] === password) {
    // Obtener IP pública (X-Forwarded-For si está detrás de proxy)
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // Obtener hostname del servidor (no del cliente, por limitación de HTTP)
    const hostname = os.hostname();
    const now = new Date().toISOString();
    const log = `User: ${username}, IP: ${ip}, Host: ${hostname}, Date: ${now}\n`;
    fs.appendFileSync('login_log.txt', log);
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});


// Endpoint para guardar serviceId en serviceID_log.txt
app.post('/log-serviceid', (req, res) => {
  const { serviceId } = req.body;
  if (serviceId) {
    fs.appendFile('serviceID_log.txt', serviceId + '\n', err => {
      if (err) return res.status(500).send('Error saving serviceId');
      res.send('ServiceId saved');
    });
  } else {
    res.status(400).send('No serviceId provided');
  }
});

app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
