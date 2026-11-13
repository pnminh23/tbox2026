import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import connectDB from './config/mongoose.js';
import authRouter from './routes/authRoutes.js';
import AccountRouter from './routes/AccountRoutes.js';
import FilmRouter from './routes/filmRoutes.js';
import BranchRouter from './routes/branchRoutes.js';
import RoomRouter from './routes/roomRoutes.js';
import TimeSlotsRouter from './routes/timeSlotsRoutes.js';
import PromotionRouter from './routes/promotionRoutes.js';
import ComboRouter from './routes/comboRoutes.js';
import BookingRouter from './routes/bookingRoutes.js';
import PaymentRouter from './routes/paymentRoutes.js';
import ReviewRouter from './routes/reviewRoutes.js';
import NewsRouter from './routes/newsRoutes.js';
import { initChatbotSocket } from './sockets/initChatbotSocket.js';
import { startBookingCleanupJob } from './services/cronJobs.js';
import { errorHandler } from './middlewares/errorHandler.js';

const corsOptions = { origin: env.CLIENT_URLS, credentials: true };

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

app.set('trust proxy', 1); // lấy đúng IP client sau proxy (rate limit)
app.use(cors({ ...corsOptions, allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Controller dùng req.io để phát sự kiện realtime
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.get('/', (req, res) => res.send('API working'));
app.use('/api/auth', authRouter);
app.use('/api/account', AccountRouter);
app.use('/api/film', FilmRouter);
app.use('/api/branch', BranchRouter);
app.use('/api/room', RoomRouter);
app.use('/api/timeSlots', TimeSlotsRouter);
app.use('/api/promotion', PromotionRouter);
app.use('/api/combo', ComboRouter);
app.use('/api/review', ReviewRouter);
app.use('/api/news', NewsRouter);
app.use('/api/booking', BookingRouter);
app.use('/api/payos', PaymentRouter);
app.use((req, res) => res.status(404).json({ success: false, message: 'Không tìm thấy API' }));
app.use(errorHandler);

initChatbotSocket(io);

await connectDB();
startBookingCleanupJob(io);
server.listen(env.APP_PORT, () => console.log(`Server is running on http://${env.APP_HOST}:${env.APP_PORT}`));
