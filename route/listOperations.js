const express = require('express');
const router = express.Router();
const listSchema = require('../model/listModel');
const Joi = require('joi');

/*

*/
router.get('/:listId?', async function (req, res) {
  // show all lits of this user or show single list
  try {
    // create new list for this user
    const { uuid } = req.body;
    const listId = req.params.listId;

    const listTitleSchema = Joi.object({
      listId: Joi.string().min(24).max(24),
    });

    const { error: schemaError } = await listTitleSchema.validate({
      listId,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    let userTodoLists;

    if (undefined !== listId) {
      if (24 !== listId.length) {
        res.status(400).json({
          success: false,
          message: 'Invalid list id',
        });
        return;
      }
      userTodoLists = await listSchema.findById(listId);
    } else {
      userTodoLists = await listSchema.find({
        author_id: uuid,
      });
    }

    if (null === userTodoLists) {
      res.status(400).json({
        success: true,
        message: 'List id is invalid',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lists titles retrieved successfully',
      data: userTodoLists,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'something went wrong while creating list: ' + error,
    });
  }
});

/*
  {
    "title": [string]
  }
*/
router.post('/', async function (req, res) {
  try {
    // create new list for this user
    const { title: listTitle, uuid } = req.body;

    const listTitleSchema = Joi.object({
      listTitle: Joi.string().required(),
    });

    const { error: schemaError } = await listTitleSchema.validate({
      listTitle,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    const listObject = new listSchema({
      title: listTitle,
      author_id: uuid,
    });
    await listObject.save();

    res.status(200).json({
      success: true,
      message: 'List created successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'something went wrong while creating list: ' + error,
    });
  }
});

/*

*/
router.put('/:listId', async function (req, res) {
  // update this list
  try {
    // create new list for this user
    const { newListTitle } = req.body;
    const listId = req.params.listId;

    const listTitleSchema = Joi.object({
      listTitle: Joi.string().required(),
      listId: Joi.string().min(24).max(24).required(),
    });

    const { error: schemaError } = await listTitleSchema.validate({
      listTitle: newListTitle,
      listId,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    let userTodoLists;

    if (undefined !== listId && 24 === listId.length) {
      userTodoLists = await listSchema.findById(listId);
      userTodoLists.title = newListTitle;
      await userTodoLists.save();
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid list id',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'List title updated successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'something went wrong while creating list: ' + error,
    });
  }
});

/*

*/
router.delete('/:listId', async function (req, res) {
  // delete this list
  try {
    // create new list for this user
    const listId = req.params.listId;

    const listTitleSchema = Joi.object({
      listId: Joi.string().min(24).max(24).required(),
    });

    const { error: schemaError } = await listTitleSchema.validate({
      listId,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    let deleteStatus;

    if (undefined !== listId && 24 === listId.length) {
      deleteStatus = await listSchema.deleteOne({ _id: listId });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid list id',
      });
      return;
    }

    if (deleteStatus.deletedCount === 0) {
      res.status(400).json({
        success: true,
        message: 'List not found.',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'List deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'something went wrong while creating list: ' + error,
    });
  }
});

module.exports = router;
