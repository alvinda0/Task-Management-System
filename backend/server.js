require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection on startup
    const conn = await pool.getConnection();
    console.log(`✅ Database connected: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
    conn.release();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
  }
}

startServer();