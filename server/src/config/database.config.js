import { connect } from 'mongoose';

export const connectDB = async () => {

  const {MONGO_HOST, MONGO_USERNAME, MONGO_PASSWORD, MONGO_PORT} = process.env;

  try {
    await connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`);
  } catch (err) {
    console.error("MongoDB connection error: ", err.message);
    process.exit(1);
  }
}
