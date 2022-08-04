const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js')
const productController = require("../controllers/productController")
const cartController = require("../controllers/cartController")
const orderController = require("../controllers/orderController")
const MW = require("../authorization/auth.js")



//=================================  User Handlers  ===============================//
router.post('/register', userController.createUser);

router.post("/login", userController.loginUser)

router.get("/user/:userId/profile",  userController.getUser)

router.put("/user/:userId/profile", userController.updateUser)


//=============================  Product Handlers  ===============================//
router.post("/products", productController.createProduct)

router.get("/products", productController.getProducts)

router.get("/products/:productId", productController.getProductById)

router.put("/products/:productId", productController.updateProduct)

router.delete("/products/:productId", productController.deleteProduct)


//============================  Cart Handlers  ==================================//
router.post("/users/:userId/cart", cartController.createCart)

router.put("/users/:userId/cart", cartController.updateCart)

router.get("/users/:userId/cart", cartController.getCart)

router.delete("/users/:userId/cart", cartController.deleteCart)


//==========================  Order Handlers  ================================//
router.post("/users/:userId/orders", orderController.createOrder)

router.put("/users/:userId/orders", orderController.updateOrder)




//============================  Invalid Request  ============================//
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        msg: "The api you requested is not available!"
    })
})

module.exports = router;