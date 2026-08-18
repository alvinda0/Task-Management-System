const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const taskController = require("../controllers/task.controller");

router.use(authenticate);

router.post("/", taskController.createTask);
router.get("/", taskController.getTasks);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Endpoint test — trigger pengiriman email deadline secara manual
router.post("/test-deadline-email", taskController.triggerDeadlineEmail);

module.exports = router;