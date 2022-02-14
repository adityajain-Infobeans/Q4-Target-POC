const express = require('express');
const router = express.Router();
const taskSchema = require('../model/taskModel');
const Joi = require('joi');

router.get('/:taskId?', async function (req, res) {
  // show all lits of this user or show single list
  try {
    // create new task for this user
    const { uuid, listId } = req.body;
    const taskId = req.params.taskId;

    const listTitleSchema = Joi.object({
      taskId: Joi.string().min(24).max(24),
      listId: Joi.string().min(24).max(24).required(),
    });

    const { error: schemaError } = await listTitleSchema.validate({
      taskId,
      listId,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    let userTodoTasks;

    if (undefined !== taskId) {
      if (24 !== taskId.length) {
        res.status(400).json({
          success: false,
          message: 'Invalid task id',
        });
        return;
      }
      userTodoTasks = await taskSchema.findById(taskId);
    } else {
      userTodoTasks = await taskSchema.find({
        author_id: uuid,
        list_id: listId,
      });
    }

    if (null === userTodoTasks) {
      res.status(400).json({
        success: true,
        message: 'Task id is invalid',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lists titles retrieved successfully',
      data: userTodoTasks,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'something went wrong while retrieving tasks: ' + error,
    });
  }
});

router.post('/', async function (req, res) {
  try {
    // create new task for this user
    const { task_description, listId } = req.body;

    const taskDescriptionSchema = Joi.object({
      task_description: Joi.string().required(),
      listId: Joi.string().min(24).max(24).required(),
    });

    const { error: schemaError } = await taskDescriptionSchema.validate({
      task_description,
      listId,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    const taskObject = new taskSchema({
      list_id: listId,
      task_description: task_description,
    });
    await taskObject.save();

    res.status(200).json({
      success: true,
      message: 'Task successfully added to the list',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message:
        'something went wrong while adding new task to the list: ' + error,
    });
  }
});

router.put('/:taskId', async function (req, res) {
  // update this task
  try {
    // create new list for this user
    const { task_description } = req.body;
    const taskId = req.params.taskId;

    const taskDescriptionSchema = Joi.object({
      task_description: Joi.string().required(),
      taskId: Joi.string().min(24).max(24).required(),
    });

    const { error: schemaError } = await taskDescriptionSchema.validate({
      task_description: task_description,
      taskId,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    let userTaskDescription;

    if (undefined !== taskId && 24 === taskId.length) {
      userTaskDescription = await taskSchema.findById(taskId);
      userTaskDescription.task_description = task_description;
      await userTaskDescription.save();
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid list id',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task description updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'something went wrong while updating task description: ' + error,
    });
  }
});

router.delete('/:taskId', async function (req, res) {
  // delete this task
  try {
    const taskId = req.params.taskId;

    const taskDeleteSchema = Joi.object({
      taskId: Joi.string().min(24).max(24).required(),
    });

    const { error: schemaError } = await taskDeleteSchema.validate({
      taskId,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    let deleteStatus;

    if (undefined !== taskId && 24 === taskId.length) {
      deleteStatus = await taskSchema.deleteOne({ _id: taskId });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid task id',
      });
      return;
    }

    if (deleteStatus.deletedCount === 0) {
      res.status(400).json({
        success: true,
        message: 'Task not found.',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'something went wrong deleting task: ' + error,
    });
  }
});

module.exports = router;
