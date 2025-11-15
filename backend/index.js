import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import mailRoutes from "./mails/route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.DB_URL;
app.use(cors("*"));
app.use(express.json());

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use("/api/mail", mailRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
