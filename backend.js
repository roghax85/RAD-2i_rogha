
const path = require('path');
const express = require('express');
const fs = require('fs');
const os = require('os');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 8989;
const JWT_SECRET = 'tu-secreto-seguro-rad2i'; // En producción, usar una variable de entorno
// Servir archivos estáticos (HTML, JS, CSS) desde la raíz
app.use(express.static(path.join(__dirname)));
// backend.js

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

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Token invalid or expired' });
    }
    req.user = user;
    next();
  });
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
    
    // Crear token JWT que expira en 15 minutos
    const token = jwt.sign(
      { username: username },
      JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({ 
      success: true, 
      message: 'Login successful',
      token: token 
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});


// Endpoint para guardar serviceId en serviceID_log.txt
app.post('/log-serviceid', authenticateToken, (req, res) => {
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
