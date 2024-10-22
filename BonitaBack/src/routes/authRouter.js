const express = require("express");
const router = express.Router();
const createUsers = require("../controller/Users/createUsers");
const authUser = require("../controller/Users/authUser");


router.post("/register", createUsers);

router.post("/login", authUser);

module.exports = router;
