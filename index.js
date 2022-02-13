const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

require('dotenv').config();

const listOperations = require('./route/listOperations');
const taskOperations = require('./route/taskOperations');
const userAuth = require('./route/userAuth');

app.use(cors());
app.use(express.json());

/* 

API :
List CRUD
Task CRUD
User register & login
*/

app.use('/auth', db_connect, userAuth);
app.use('/list', db_connect, checkAuth, listOperations);
app.use('/task', db_connect, checkAuth, taskOperations);

app.listen(process.env.PORT || port);

function db_connect(req, res, next) {
  mongoose.connect(
    `${process.env.DATABASE}`,
    () => {
      console.log('Database Connected');
      next();
      return;
    },
    (e) => {
      console.log('Error ', err);
      res.status(503).json({
        status: 'error',
        message: 'error occurred while connecting with database',
        data: {},
      });
    }
  );
}

function checkAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (authHeader && token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
      if (err) {
        console.log(err);
        res.status(401).json({
          status: 'error',
          message: 'JWT auth failed',
          data: {},
        });
        return;
      }

      req.body.uuid = data.uuid;
      next();
    });
  } else {
    res.status(400).json({
      status: 'error',
      message: 'JWT not provided',
      data: {},
    });
    return;
  }
}
