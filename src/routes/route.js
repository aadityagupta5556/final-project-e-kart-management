const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js')




router.post('/register', userController.createUser);

router.get("/user/:userId/profile", userController.loginUser)

router.put("/user/:userId/profile", userController.updateUser)




module.exports = router;