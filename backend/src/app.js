const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const response = require("./utils/response");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return response.success(
    res,
    "Task Management API"
  );
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Global Error Handler (HARUS PALING BAWAH)
app.use((err, req, res, next) => {
  console.error(err);

  return response.error(
    res,
    err.message || "Internal Server Error",
    err.status || 500
  );
});

module.exports = app;