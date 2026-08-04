const db = require("../config/db");

async function findByEmail(email) {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return rows[0];
}

async function findById(id) {
  const [rows] = await db.execute(
    "SELECT id, name, email FROM users WHERE id = ?",
    [id]
  );

  return rows[0];
}

async function createUser({ name, email, password }) {
  const [result] = await db.execute(
    `INSERT INTO users (name, email, password)
     VALUES (?, ?, ?)`,
    [name, email, password]
  );

  return result.insertId;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
};