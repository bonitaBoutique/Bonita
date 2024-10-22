// src/controllers/Users/index.js
const createUsers = require('./createUsers');
const putUser = require('./putUser');
const deleteUser = require('./deleteUser');
const getAllUsers = require('./getAllUsers');
const getUserByDocument = require('./getUserByDocument');
const authUser = require('./authUser')

module.exports = {
  createUsers,
  putUser,
  deleteUser,
  getAllUsers,
  getUserByDocument,
  authUser
};
