import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./modules/v1/auth/auth.route";
import checkRouter from "./modules/v1/check/check.route";
import { setupSwagger } from "./lib/swagger";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://verimail.codeprephub.com",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/check", checkRouter);

setupSwagger(app);

export default app;
