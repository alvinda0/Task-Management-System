const taskService = require("../services/task.service");
const response = require("../utils/response");

async function createTask(req, res, next) {
  try {
    const task = await taskService.createTask(req.user.id, req.body);

    return response.success(
    res,
    "Task berhasil dibuat",
    task,
    null,
    201
);
  } catch (error) {
    next(error);
  }
}

async function getTasks(req, res, next) {
  try {
    const {
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const result = await taskService.getTasks(
      req.user.id,
      status,
      Number(page),
      Number(limit)
    );

    return response.success(
    res,
    "Berhasil mengambil data task",
    result.data,
    result.metadata
);
  } catch (error) {
    next(error);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await taskService.getTaskById(
      req.params.id,
      req.user.id
    );

   return response.success(
    res,
    "Berhasil mengambil detail task",
    task
);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res) {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.user.id,
      req.body
    );

    return response.success(
    res,
    "Task berhasil diperbarui",
    task
);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res) {
  try {
    await taskService.deleteTask(req.params.id, req.user.id);

    return response.success(
    res,
    "Task berhasil dihapus"
);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
};