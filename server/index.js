const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes.js');
const messageRoutes = require('./routes/messages.js');
const app = express();
const socket = require('socket.io');
require('dotenv').config();
const path = require('path');
app.use(cors());
app.use(express.json());
app.use('/api/auth', userRoutes);
app.use('/api/messages', messageRoutes);

app.use(express.static(path.join(__dirname, '../client/build')));
// const MONGO_URL =
//   'mongodb+srv://alfeez:alfeez@cluster0.2z0sxnr.mongodb.net/?retryWrites=true&w=majority';
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connection Successful');
  })
  .catch((err) => {
    console.log(err.message);
  });
const PORT = 5000;
const server = app.listen(process.env.PORT, () => {
  console.log(`server started on ${process.env.PORT}`);
});
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '../client/build/index.html'))
);
const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});
global.onlineUsers = new Map();
io.on('connection', (socket) => {
  global.chatSocket = socket;
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
  });
  socket.on('send-msg', (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-recieve', data.msg);
    }
  });
});
