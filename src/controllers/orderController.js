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











const updateOrder= async function (req, res){
    try {
         let userId= req.params.userId
         let body= req.body
         
         // validating request body .
        if(!validation.isValidBody(body)){
            return res.status(400).send({status : false, message : "Please provide inputs in body!"})
        }

        if(!validation.idMatch(userId)){
            return res.status(400).send({status : false , message: "Invalid  userId in params"})
          }
          const searchUser= await userModel.findOne({ _id: userId });
          if(!searchUser){
            return res.status(400).send({ status:false , message: "The userId you have provided doesn't exist!"})
          }

         // extracting params
          const{orderId, status} =  body

          if(!orderId) return res.status(400).send({status: false , message: `Order doesn't exist for ${orderId} `});

          
          // verifying does the order belongs to user or not 
          let isOrder = await orderModel.findOne({ _id : orderId});
          if(!isOrder) return res.status(400).send({ status:false , message: `Order doesn't belongs to ${orderId}`});

            if(isOrder.userId != userId) return res.status(403).send({status : false, message : "This cart doesn't belong to you!"})

          
         if(!status){
           return res.status(400).send({ status: false , message :"Status not provided. Please enter current status of the order."})
         }

         if(isOrder.cancellable == true){
            if(!["pending", "completed", "cancelled"].includes(status)) return res.status(400).send({status : false, msg : "Should include 'pending', 'completed' or 'cancelled' only!"})
            
         }else{
            if(status == "cancelled") return res.status(403).send({status : false, message : "This product cannot be cancelled"})
            if(!["pending", "completed"].includes(status)) return res.status(400).send({status : false, msg : "Should include 'pending' or 'completed' only!"})
         }

          let finalData = await orderModel.findOneAndUpdate({body}, {$set : {status : status}}, {new : true})
          res.status(200).send({status : true, message : "Order updated!", data : finalData})

    } catch(err){
       res.status(500).send({status : false, message : err.message})
    }
}




module.exports = {createOrder, updateOrder}