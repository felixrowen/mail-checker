import express from "express";
import authRouter from "./modules/v1/auth/auth.route";
import checkRouter from "./modules/v1/check/check.route";
import cors from "cors";
import morgan from "morgan";

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://verimail-check.vercel.app',
    'https://codeprephub.com',
    'https://www.codeprephub.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev")); 

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/check", checkRouter);

export default app;