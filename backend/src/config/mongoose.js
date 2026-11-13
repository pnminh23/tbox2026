import mongoose from 'mongoose';
import { env } from './env.js';

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log('Database connected!'));
    await mongoose.connect(env.MONGODB_URI, { dbName: env.DATABASE_NAME });
};

export default connectDB;
