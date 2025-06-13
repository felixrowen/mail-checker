import express from "express";
import authRouter from "./modules/v1/auth/auth.route";
import cors from "cors";
import morgan from "morgan";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev")); 

app.use("/api/v1/auth", authRouter);

export default app;