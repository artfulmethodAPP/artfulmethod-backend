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

module.exports = { createTask };
