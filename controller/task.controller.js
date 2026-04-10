const TaskService = require("../services/task.service");
const asyncHandler = require("../utils/async-handler");
const { sendSuccess } = require("../utils/api-response");
const AppError = require("../utils/app-error");

const createTask = asyncHandler(async (req, res) => {
  const { type } = req.body;
  let image_url = null;

  if (type === "image") {
    if (!req.file) {
      throw new AppError(
        "Image file is required for type 'image'",
        400,
        "VALIDATION_ERROR",
      );
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

  return sendSuccess(res, {
    statusCode: 201,
    message: "Task created successfully",
    data: { task },
  });
});

const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const nextType = req.body.type;
  let image_url;
  const hasBodyFields = Object.keys(req.body).length > 0;

  if (req.file) {
    const host = req.get("host");
    const protocol = req.protocol;
    image_url = `${protocol}://${host}/uploads/tasks/${req.file.filename}`;
  }

  if (!hasBodyFields && !req.file) {
    throw new AppError(
      "At least one field is required to update task",
      400,
      "VALIDATION_ERROR",
    );
  }

  if (nextType === "question" && req.file) {
    throw new AppError(
      "Image file is not allowed for question type task",
      400,
      "VALIDATION_ERROR",
    );
  }

  const task = await TaskService.updateTask(id, {
    ...req.body,
    image_url,
  });

  return sendSuccess(res, {
    message: "Task updated successfully",
    data: { task },
  });
});

const getAllTasks = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const isAdmin = req.user.role === "admin";

  const filter = {};
  if (type) filter.type = type;

  if (!isAdmin) {
    filter.is_active = true;
  }
  filter.isAdmin = isAdmin;

  const tasks = await TaskService.getAllTasks(filter);

  return sendSuccess(res, {
    message: "Tasks retrieved successfully",
    data: { tasks },
  });
});


const getRecentTasks = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const isAdmin = req.user.role === "admin";

  const filter = { type };
  if (!isAdmin) {
    filter.is_active = true;
  }
  filter.isAdmin = isAdmin;

  const task = await TaskService.getRecentTasks(filter);

  return sendSuccess(res, {
    message: "Recent task retrieved successfully",
    data: { task },
  });
});

const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await TaskService.deleteTask(id);

  return sendSuccess(res, {
    message: "Task deleted successfully",
    data: { task },
  });
});





module.exports = {
  createTask,
  updateTask,
  getAllTasks,
  getRecentTasks,
  deleteTask,
};
