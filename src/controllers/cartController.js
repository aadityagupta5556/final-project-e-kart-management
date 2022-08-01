const cartModel = require("../models/cartModel.js")


const createCart = async function (req, res){
    try{
        let body = req.body
        
    }catch(error){
        res.status(500).send({message : error.message})
    }
}