const orderModel = require("../models/orderModel.js")
const cartModel = require("../models/cartModel.js")
const userModel = require("../models/userModel.js")
const validation = require("../validations/validator.js")



//==================================  Create Order  =================================//

const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        let cartId = data.cartId

        if (!validation.isValidBody(data)) return res.status(400).send({ status: false, message: "Body cannot be empty!" })


        if (!validation.idMatch(userId)) return res.status(400).send({ status: false, message: "Invalid userId!" })
        let uniqueUser = await userModel.findOne({ _id: userId })
        if (!uniqueUser) return res.status(404).send({ status: false, message: "No such user was found!" })


        if (!cartId) return res.status(400).send({ status: false, message: "CartId cannot be empty!" })
        if (!validation.idMatch(cartId)) return res.status(400).send({ status: false, message: "Invalid cartId!" })

        let cart = await cartModel.findOne({ _id: cartId })

        if (!cart) return res.status(404).send({ status: false, message: "No such cart was found!" })
        if (cart.userId != userId) return res.status(403).send({ status: false, message: "You're forbidden to edit/create this cart!" })

        let obj = { userId: userId, items: cart.items, totalPrice: cart.totalPrice, totalItems: cart.totalItems, totalQuantity: 0, status: "pending", cancellable: true }

        let count = 0
        let items = cart.items
        for (let i = 0; i < items.length; i++) {
            count += items[i].quantity
        }
        obj["totalQuantity"] = count
        
        let finalData = await orderModel.create(obj)
        res.status(200).send({ status: true, message : "Successfully created an order!", data : finalData})

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = {createOrder}