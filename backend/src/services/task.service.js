const taskRepository = require("../repositories/task.repository");
const { getPaginationMetadata } = require("../utils/pagination");

const VALID_STATUS = ["pending", "in-progress", "done"];
const ALLOWED_LIMITS = [10, 25, 50, 100];

async function createTask(userId, data) {
  const {
    title,
    description = null,
    status = "pending",
    deadline = null,
  } = data;

  if (!title || !title.trim()) {
    throw new Error("Title wajib diisi");
  }

  if (!VALID_STATUS.includes(status)) {
    throw new Error("Status tidak valid");
  }

  const taskId = await taskRepository.createTask({
    title,
    description,
    status,
    deadline,
    userId,
  });

  return {
    id: taskId,
    title,
    description,
    status,
    deadline,
  };
}

async function getTasks(userId, status, page = 1, limit = 10) {
  page = Number(page);
  limit = Number(limit);

  if (page < 1 || Number.isNaN(page)) {
    page = 1;
  }

  if (status && !VALID_STATUS.includes(status)) {
    throw new Error("Status tidak valid");
  }

  if (!ALLOWED_LIMITS.includes(limit)) {
    throw new Error("Limit hanya boleh 10, 25, 50, atau 100");
  }

  const result = await taskRepository.getTasks(
    userId,
    status,
    page,
    limit
  );

  return {
    data: result.data,
    metadata: getPaginationMetadata(
      page,
      limit,
      result.metadata.total
    ),
  };
}

async function getTaskById(id, userId) {
  const task = await taskRepository.getTaskById(id, userId);

  if (!task) {
    throw new Error("Task tidak ditemukan");
  }

  return task;
}

async function updateTask(id, userId, data) {
  const task = await taskRepository.getTaskById(id, userId);

  if (!task) {
    throw new Error("Task tidak ditemukan");
  }

  const updatedTask = {
    title: data.title ?? task.title,
    description: data.description ?? task.description,
    status: data.status ?? task.status,
    deadline: data.deadline ?? task.deadline,
  };

  if (!updatedTask.title.trim()) {
    throw new Error("Title wajib diisi");
  }

  if (!VALID_STATUS.includes(updatedTask.status)) {
    throw new Error("Status tidak valid");
  }

  await taskRepository.updateTask(id, userId, updatedTask);

  return {
    id: Number(id),
    ...updatedTask,
  };
}

async function deleteTask(id, userId) {
  const task = await taskRepository.getTaskById(id, userId);

  if (!task) {
    throw new Error("Task tidak ditemukan");
  }

  await taskRepository.deleteTask(id, userId);
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};