const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// اتصال به دیتابیس (با تایم‌اوت که معطل نشه)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/discord_clone';
let isDbConnected = false;

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 })
  .then(() => {
    console.log('🍃 دیتابیس MongoDB متصل شد.');
    isDbConnected = true;
  })
  .catch(() => {
    console.log('⚠️ دیتابیس متصل نشد (پیام‌ها موقت می‌مانند).');
  });

const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  time: String,
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

app.use(express.static(__dirname));

const onlineUsers = new Map();

io.on('connection', async (socket) => {
  // ۱. تاریخچه پیام‌ها
  if (isDbConnected) {
    try {
      const history = await Message.find().sort({ createdAt: 1 }).limit(50);
      socket.emit('load_history', history);
    } catch (err) {}
  }

  // ۲. ثبت نام کاربر
  socket.on('register_user', (username) => {
    onlineUsers.set(socket.id, { username });
    io.emit('update_online_users', Array.from(onlineUsers.values()));
  });

  // ۳. پیام متنی
  socket.on('send_message', async (data) => {
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const fullMsg = { username: data.username, message: data.message, time: timeStr };

    if (isDbConnected) {
      try { await Message.create(fullMsg); } catch (err) {}
    }
    io.emit('receive_message', fullMsg);
  });

  // ۴. ویس‌چنل
  socket.on('join_voice', (peerId) => {
    socket.broadcast.emit('user_joined_voice', peerId);
  });

  // ۵. دیسکانکت
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('update_online_users', Array.from(onlineUsers.values()));
  });
});

server.listen(3000, () => {
  console.log(`🚀 سرور روشن شد: http://localhost:3000`);
});