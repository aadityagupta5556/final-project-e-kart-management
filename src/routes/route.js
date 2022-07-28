const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js')
const productController = require("../controllers/productController")
const MW = require("../authorization/auth.js")




router.post('/register', userController.createUser);

router.post("/login", userController.loginUser)

router.get("/user/:userId/profile",  userController.getUser)

router.put("/user/:userId/profile", userController.updateUser)

router.post("/products", productController.createProduct)

router.get("/products", productController.getProducts)

router.get("/products/:productId", productController.getProductById)

router.put("/products/:productId", productController.updateProduct)

router.delete("/products/:productId", productController.deleteProduct)

module.exports = router;