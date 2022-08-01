const cartModel = require("../models/cartModel.js")
const userModel = require("../models/userModel")
const productModel = require("../models/productModel")
const validation = require("../validations/validator.js")


const createCart = async function (req, res){
    try{
        let paramsUserId = req.params.userId
        if(!validation.objectIdMatch(paramsUserId)) return res.status(400).send({status : false, message : "Invalid userId format!"})

        let cartExists = await cartModel.findOne({userId : paramsUserId})

        if(!cartExists){
        let body = req.body
        let {userId, items} = body

        if(!validation.isValidBody(body)) return res.status(400).send({status : false, message : "Body should not be empty!"})
        
        if(!userId) return res.status(400).send({status : false, message : "Please provide a userId!"}) 
        if(!validation.objectIdMatch(userId)) return res.status(400).send({status : false, message : "Invalid userId format!"})
        let uniqueUser = await userModel.findOne({_id : userId})
        if(!uniqueUser) res.status(404).send({status : false, message : "No such user exists!"})

        if(!items[0].productId || items[0].productId.length == 0) return res.status(400).send({status : false, message : "Please provide a productId!"})
        if(!validation.objectIdMatch(items[0].productId)) return res.status(400).send({status : false, message : "Invalid userId format!"})
        let product = await productModel.findOne({_id : items[0].productId, isDeleted : false})
        if(!product) return res.status(404).send({status : false, message : "No product with this productId was found!"})

        let createCart = await cartModel.create(body)
        res.status(201).send({status : true, message : "Success!", data : createCart})

       
}else{
    let body = req.body
    let {userId, items, totalPrice, totalItems} = body
    let obj = {}

    if(!validation.isValidBody(body)) return res.status(400).send({status : false, message : "Body should not be empty!"})
        
    if(!userId) return res.status(400).send({status : false, message : "Please provide a userId!"}) 
    if(!validation.objectIdMatch(userId)) return res.status(400).send({status : false, message : "Invalid userId format!"})
    let uniqueUser = await userModel.findOne({_id : userId})
    if(!uniqueUser) res.status(404).send({status : false, message : "No such user exists!"})


    if(!items[0].productId || items[0].productId.length == 0) return res.status(400).send({status : false, message : "Please provide a productId!"})
    if(!validation.objectIdMatch(items[0].productId)) return res.status(400).send({status : false, message : "Invalid userId format!"})
    let product = await productModel.findOne({_id : items[0].productId, isDeleted : false})
    if(!product) return res.status(404).send({status : false, message : "No product with this productId was found!"})


    if(!items[0].quantity || items[0].quantity.length == 0) return res.status(400).send({status : false, message : "Please provide quantity!"})
    if(!validation.onlyNumbers(items[0].quantity)) return res.status(400).send({status : false, message : "Wrong quantity format!"})
    if(items[0].quantity < 1) return res.status(400).send({status : false, message : "Minimum quantity should be 1!"})


    if(!totalPrice) return res.status(400).send({status : false, message : "Please provide totalPrice!"})
    if(!validation.onlyNumbers(totalPrice)) return res.status(400).send({status : false, message : "Wrong totalPrice format!"})
    

    if(!totalItems) return res.status(400).send({status : false, message : "Please provide totalItems!"})
    if(!validation.onlyNumbers(totalItems)) return res.status(400).send({status : false, message : "Wrong totalItems format!"})

    obj.userId = body.userId
    obj.items = body.items
    obj.totalPrice = product.price * items[0].quantity
    obj.totalItems = body.totalItems

    let final = await cartModel.create(obj)
    res.status(200).send({status : true, message : "Success", data : final})
}

    }catch(error){
        res.status(500).send({message : error.message})
    }
}