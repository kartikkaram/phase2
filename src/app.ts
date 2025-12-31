import express from "express";
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { healthcheckRouter } from "./routes/healthcheck.routes";
import { userRouter } from "./routes/user.routes";
import { adminRouter } from "./routes/admin.routes";
import { postRouter } from "./routes/post.routes";
import { commentRouter } from "./routes/comment.routes";
import { voteRouter } from "./routes/vote.routes";
import { Error_Handler } from "./middlewares/errors.middlewares";
const app = express();


app.use(
  cors({
    origin: process.env.CORS_ORIGIN,  
    credentials: true,              
  }),
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({limit:"16kb"}))
app.use(express.static("public"));
app.use(cookieParser())


// routes
app.use("/api/v1/healthcheck",healthcheckRouter)
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/vote", voteRouter);


app.use(Error_Handler)



export default app;
