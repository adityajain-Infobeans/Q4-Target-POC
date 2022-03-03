const express = require('express');
const router = express.Router();
const userSchema = require('../model/userModel');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

/*
  This route is for registering new user. 
  It required user data to be sent with the request body
  Structure: {
    "user_name": [string], 
    "user_email": [string], 
    "user_password": [string], 
    "user_confirm_password": [string]
  }
*/
router.post('/register', async function (req, res) {
  //register the user
  try {
    const { user_name, user_email, user_password, user_confirm_password } =
      req.body;

    const registrationSchema = Joi.object({
      user_name: Joi.string().min(3).max(100).required(),
      user_password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
      user_confirm_password: Joi.ref('user_password'),
      user_email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net'] },
        })
        .required(),
    });

    const { error: schemaError } = await registrationSchema.validate({
      user_name,
      user_email,
      user_password,
      user_confirm_password,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    if (user_password !== user_confirm_password) {
      res.status(400).json({ success: false, message: 'Password mismatch' });
      return;
    }

    if (await userSchema.exists({ user_email: user_email })) {
      res.status(400).json({
        success: false,
        message:
          'This email is already registered, please use forgot password option if you forgot your password.',
      });
      return;
    }

    const user_password_hash = bcrypt.hashSync(user_password, 10);

    const userObject = new userSchema({
      user_name,
      user_password: user_password_hash,
      user_email,
    });
    await userObject.save();

    res.status(200).json({
      success: true,
      message: 'Registered successfully',
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/*
  This route is for signing in registered user. 
  It required user data to be sent with the request body
  Structure: {
    "user_email": [string], 
    "user_password": [string], 
  }
*/
router.post('/login', async function (req, res) {
  // check if user exist & provide JWT
  try {
    const { user_email, user_password } = req.body;

    const loginSchema = Joi.object({
      user_password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
        .required(),
      user_email: Joi.string()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net'] },
        })
        .required(),
    });

    const { error: schemaError } = await loginSchema.validate({
      user_email,
      user_password,
    });

    if (undefined !== schemaError) {
      res
        .status(400)
        .json({ success: false, message: 'Please send valid data.' });
      return;
    }

    const findRegisteredUser = await userSchema.findOne({
      user_email: user_email,
    });

    if (
      null === findRegisteredUser ||
      !bcrypt.compareSync(user_password, findRegisteredUser.user_password)
    ) {
      res.status(400).json({
        success: false,
        message: 'Wrong username or password',
      });
      return;
    }

    const { user_name: registeredUserName, _id: registeredUserUuid } =
      findRegisteredUser;

    // generate JWT
    const jwtToken = await jwt.sign(
      { name: registeredUserName, uuid: registeredUserUuid },
      process.env.JWT_SECRET
    );

    res.status(200).json({
      success: true,
      message: 'Login successfully',
      data: {
        jwt: jwtToken,
        name: registeredUserName,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
