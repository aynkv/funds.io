const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const http = require('http');
const { Server } = require('socket.io');
const goalRoutes = require('./routes/goalRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', 
        methods: ['GET', 'POST']
    },
})

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);

io.on('connection', (socket) => {
    console.log('Client connected: ', socket.id);
    socket.join(socket.handshake.query.userId || socket.handshake.auth.userId);
    socket.on('disconnect', () => console.log('Client disconnected', socket.id));
});

app.set('io', io);

app.get('/', (req, res) => {
    res.send('funds.io backend');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});