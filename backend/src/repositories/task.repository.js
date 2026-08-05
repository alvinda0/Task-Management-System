const db = require("../config/db");
const { getPagination } = require("../utils/pagination");

async function createTask(task) {
  const { title, description, status, deadline, userId } = task;

  const [result] = await db.execute(
    `INSERT INTO tasks
    (title, description, status, deadline, user_id)
    VALUES (?, ?, ?, ?, ?)`,
    [title, description, status, deadline, userId]
  );

  return result.insertId;
}


async function getTasks(userId, status, page, limit, search) {
  const { offset } = getPagination(page, limit);

  let sql = `
    SELECT
      id,
      title,
      description,
      status,
      deadline
    FROM tasks
    WHERE user_id = ?
  `;

  const params = [userId];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (search) {
    sql += " AND title LIKE ?";
    params.push(`%${search}%`);
  }

  sql += `
    ORDER BY id DESC
    LIMIT ?
    OFFSET ?
  `;

  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const [rows] = await db.execute(sql, params);

  const total = await countTasks(userId, status, search);

  return {
    data: rows,
    metadata: { total },
  };
}

async function getTaskById(id, userId) {
  const [rows] = await db.execute(
    `SELECT *
     FROM tasks
     WHERE id = ? AND user_id = ?`,
    [id, userId]
  );

  return rows[0];
}

async function countTasks(userId, status, search) {
  let sql = `
    SELECT COUNT(*) total
    FROM tasks
    WHERE user_id = ?
  `;

  const params = [userId];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  if (search) {
    sql += " AND title LIKE ?";
    params.push(`%${search}%`);
  }

  const [[result]] = await db.execute(sql, params);

  return result.total;
}

async function updateTask(id, userId, task) {
  const { title, description, status, deadline } = task;

  const [result] = await db.execute(
    `UPDATE tasks
     SET
        title = ?,
        description = ?,
        status = ?,
        deadline = ?
     WHERE id = ?
     AND user_id = ?`,
    [title, description, status, deadline, id, userId]
  );

  return result.affectedRows;
}

async function deleteTask(id, userId) {
  const [result] = await db.execute(
    `DELETE FROM tasks
     WHERE id = ?
     AND user_id = ?`,
    [id, userId]
  );

  return result.affectedRows;
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  countTasks,
};