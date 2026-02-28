
const express = require('express');
const http = require('http');
const session = require('express-session');
const bcrypt = require('bcrypt');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_institucional',
  resave: false,
  saveUninitialized: false
}));

// Base de datos simple
const USERS_FILE = './data/users.json';

if (!fs.existsSync('./data')) fs.mkdirSync('./data');

if (!fs.existsSync(USERS_FILE)) {
  const defaultUser = {
    username: "admin",
    password: bcrypt.hashSync("admin123", 10),
    role: "Administrador"
  };
  fs.writeFileSync(USERS_FILE, JSON.stringify([defaultUser], null, 2));
}

function getUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = getUsers();

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: "Usuario no existe" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Contraseña incorrecta" });

  req.session.user = {
    username: user.username,
    role: user.role
  };

  res.json({ success: true, role: user.role });
});

app.get('/session', (req, res) => {
  res.json(req.session.user || null);
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('mensaje', (msg) => {
    io.emit('mensaje', msg);
  });

});

server.listen(PORT, () => {
  console.log("Sistema institucional ejecutándose en puerto " + PORT);
});
