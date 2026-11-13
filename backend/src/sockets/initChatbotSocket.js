import { clearChatSession, handleChat } from '../controllers/chatbotController.js';

const MIN_INTERVAL_MS = 1500; // chống spam làm tốn chi phí OpenAI
const MAX_LENGTH = 500;

export const initChatbotSocket = (io) => {
    io.on('connection', (socket) => {
        let lastAt = 0;

        socket.on('chatbot:message', async (msg) => {
            if (typeof msg !== 'string' || !msg.trim()) return;
            if (Date.now() - lastAt < MIN_INTERVAL_MS) {
                return socket.emit('chatbot:reply', 'Bạn nhắn hơi nhanh, đợi mình một chút nhé!');
            }
            lastAt = Date.now();

            try {
                socket.emit('chatbot:reply', await handleChat(msg.slice(0, MAX_LENGTH), socket.id));
            } catch (error) {
                console.error('Lỗi chatbot:', error.message);
                socket.emit('chatbot:reply', 'Xin lỗi, tôi đang gặp sự cố.');
            }
        });

        socket.on('disconnect', () => clearChatSession(socket.id));
    });
};
