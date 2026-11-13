import { io } from 'socket.io-client';

export const socket = io('http://localhost:2911', {
    withCredentials: true,
});
