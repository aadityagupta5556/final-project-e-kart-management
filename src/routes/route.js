const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js')
const MW = require("../authorization/auth.js")




router.post('/register', userController.createUser);

router.post("/login", userController.loginUser)

router.get("/user/:userId/profile", MW.authorize, userController.getUser)

router.put("/user/:userId/profile", userController.updateUser)




module.exports = router;