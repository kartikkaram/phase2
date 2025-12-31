import "dotenv/config";
import app from "./app";
import { AppDataSource } from "./dbConnection";
import { connectRedis } from "./config/redisClient";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    await connectRedis(); 
    console.log("Redis connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup failed", err);
    process.exit(1);
  }
};

startServer();
