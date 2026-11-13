import express from 'express';
import { optionalAuth, requireAdmin } from '../middlewares/authMiddleware.js';
import { createRoom, deleteRoom, editRoom, getRoom, getRoomByBranchId } from '../controllers/roomController.js';

import { createTypeRoom, deleteTypeRoom, editTypeRoom, getAllTypeRooms } from '../controllers/roomTypeController.js';
import { uploader } from '../config/cloudinary.js';

const RoomRouter = express.Router();

RoomRouter.post('/create-room', requireAdmin, uploader.single('image'), createRoom);
RoomRouter.post('/create-roomType', requireAdmin, createTypeRoom);
RoomRouter.get('/get-all-roomType', getAllTypeRooms);
RoomRouter.get('/get-room/:branch/:type', optionalAuth, getRoom);
RoomRouter.get('/get-room-branch/:branch', getRoomByBranchId);
RoomRouter.put('/edit-room/:_id', requireAdmin, uploader.single('image'), editRoom);
RoomRouter.put('/edit-type-room/:_id', requireAdmin, editTypeRoom);

RoomRouter.delete('/delete-room/:_id', requireAdmin, deleteRoom);
RoomRouter.delete('/delete-roomType/:_id', requireAdmin, deleteTypeRoom);

export default RoomRouter;
