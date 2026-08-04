const db = require("./db");

async function testConnection() {
  try {
    const connection = await db.getConnection();

    console.log("✅ Database Connected");

    connection.release();
  } catch (error) {
    console.error("❌ Failed to connect database");
    console.error(error.message);
  }
}

testConnection();