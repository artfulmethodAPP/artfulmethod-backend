const TaskService = require("../services/task.service");

const createTask = async (req, res) => {
  try {
    const { type } = req.body;
    let image_url = null;

    if (type === "image") {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required for type 'image'",
        });
      }
      const host = req.get("host");
      const protocol = req.protocol;
      image_url = `${protocol}://${host}/uploads/tasks/${req.file.filename}`;
    }

    const taskData = {
      ...req.body,
      user_id: req.user.id,
      image_url: type === "image" ? image_url : null,
    };

    const task = await TaskService.createTask(taskData);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

<<<<<<< HEAD
const getAllTasks = async (req, res) => {
  try {
    const { type } = req.query;
    const isAdmin = req.user.role === "admin";

    const filter = {};
    if (type) filter.type = type;

    if (!isAdmin) {
      // Non-admins only see active tasks
      filter.is_active = true;
    }
    filter.isAdmin = isAdmin;

    const tasks = await TaskService.getAllTasks(filter);

    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await TaskService.deleteTask(id);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      task,
    });
  } catch (error) {
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { createTask, getAllTasks, deleteTask };
=======
module.exports = { createTask };
>>>>>>> 5c1ee93a6d068a3bff3b4184ef7f2d47e8e8cbda
