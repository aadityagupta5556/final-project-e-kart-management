const productModel = require("../models/productModel.js")
const validation = require("../validations/validator.js")
const mongoose = require("mongoose")



const createProduct = async function (req, res) {

    try{
    let data = req.body;
    let files =req. files;

    let{title, description,  price,  currencyId,  currencyFormat,  isFreeShipping, style, availableSizes,  installments } = data

    if (!validation.isValidBody(data)) {
        return res.status(400).send({ status: false, msg: "Please provide data in request body" })
    }
    if (!validation.isValid(title)) {
        return res.status(400).send({ status: false, msg: "fname is invalid" })
    }
    let uniquetitle=await productModel.findOne({title :data.title})
    if(uniquetitle) return res.status(400).send({ status: false, msg: "This title is already exist , please enter another title." })

    if (!validation.isValid(description) ) {
        return res.status(400).send({ status: false, msg: "fname is invalid" })
    }

    
    if (!validation.isValid(price) && !validation.isValidPrice(price)) {
        return res.status(400).send({ status: false, msg: "Price is invalid" })

    }
    if(currencyId!="INR")  return res.status(400).send({ status: false, msg: `Please provide the currencyid as "INR" ` })

     
    if(currencyFormat!="₹")  return res.status(400).send({ status: false, msg: `Please provide the currencyformat as "₹" ` })


    if(!(isFreeShipping=="true" || isFreeShipping=="false")){return res.status(400).send({status:false,msg:"Input must be in True or False"})}

    if (!validation.isValid(style))  {
        return res.status(400).send({ status: false, msg: "Style is invalid" })

    }

    if (!availableSizes) return res.status(400).send({ status: false, message: "AvailableSizes is Required" })
    
    if (availableSizes) {
        var size = availableSizes.split(" ").filter(a=>a).join("").toUpperCase().split(",") //creating an array
      
    }

    for (let i = 0; i < size.length; i++) {
        if (!["S", "XS", "M", "L", "XXL", "XL"].includes(size[i])) {
            return res.status(400).send({ status: false, message: "Size should be one of these - 'S', 'XS', 'M', 'L', 'XXL', 'XL'" })
        }
    }
    

    if (!validation.isValid(installments) && !validation.isValidPrice(installments)) {
        return res.status(400).send({ status: false, msg: "Installments is invalid." })

    }




    if (files && files.length > 0) {
      
        let uploadedFileURL = await upload.uploadFile(files[0])
      
        data.productImage = uploadedFileURL;
    }
    else {
        res.status(400).send({ msg: "No file found" })
    }
    const document = await productModel.create(data)
    res.status(201).send({ status: true, data: document })
}
catch (err) {
    res.status(500).send({ staus: false, msg: err.message })
}
}










const getProducts = async function (req, res){
     try{
        let query = req.query
        if(!query){
            let getAll = await productModel.find({isDeleted : false}).sort("price")
            if(!getAll) return res.status(404).send({status : false, msg : "No products found!"})
            res.status(200).send({status : true, message : "Success!", data : getAll })
        }
        
        
        if(query.size){
          let size = query.size
          if(!["S", "XS", "M", "L", "XXL", "XL"].includes(size)){
            return res.status(400).send({status : false, msg : "Should include 'S', 'XS, 'M', 'L', 'XL' and 'XXL' only!"})
        }
          let getSize = await productModel.find({availableSizes : size})
          if(getSize.length == 0) return res.status(404).send({status : false, message : "No product with this size was found!"})
        }

        if(query.name){
            let name = query.name
            if(!validation.isValid(name)) return res.status(400).send({status : false, msg : "Invalid naming format!"})
            let getName = await productModel.find({title : name})
            if(getName.length == 0) return res.status(404).send({status : false, message : "No product with this name was found!"})
          }
       

        if(query.priceGreaterThan){
            let priceGreaterThan = query.priceGreaterThan
            if(!validation.onlyNumbers(priceGreaterThan)) return res.status(400).send({status : false, message : "Only numbers are allowed!"})
            let getpriceGreaterThan = await productModel.find({price:{ $gte : priceGreaterThan}})
            if(getpriceGreaterThan.length == 0) return res.status(404).send({status : false, message : "No product with price greater than this was found!"})
          }

          if(query.priceLessThan){
            let priceLessThan = query.priceLessThan
            if(!validation.onlyNumbers(priceLessThan)) return res.status(400).send({status : false, message : "Only numbers are allowed!"})
            let getpriceLessThan = await productModel.find({price: { $lte : priceLessThan}})
            if(getpriceLessThan.length == 0) return res.status(404).send({status : false, message : "No product with price less than this was found!"})
          }
         
        
        let getAllProducts = await productModel.find({query, isDeleted : false}).sort("price")
        if(!getAllProducts) return res.status(404).send({status : false, msg : "No products found!"})

        return res.status(200).send({status : true, message : "Success", data : getAllProducts})


     }catch(error){
        res.status(500).send({message : error.message})
     }
}






const getProductById = async function (req,res){
    try{
        let productId = req.params.productId
        let isValidProductID = mongoose.isValidObjectId(productId);
      if (!isValidProductID) return res.status(400).send({ status: false, message: "ProductId is not valid" });

      let getAll = await productModel.findOne({_id : productId, isDeleted : false}).sort("price")
      if(!getAll) return res.status(404).send({status : false, msg : "No product found with this ProductId!"})

      return res.status(200).send({status : true, message : "Success", data : getAll})
    }catch(error){
        res.status(500).send({message : error.message})
    }
}







const deleteProduct= async function(req,res){
    try{
        let productId = req.params.productId

        let isValidProductID = mongoose.isValidObjectId(productId);
        if (!isValidProductID) return res.status(400).send({ status: false, message: "ProductId is not valid!" });
        
        const product = await productModel.findOne({_id: productId})

        if(!product){
            return res.status(400).send({status: false, message:`Product doesn't exist by ${productId} this id.`})

        }
        if (product.isDeleted==false){
            await productModel.findOneAndUpdate({_id: productId},{$set:{isDeleted:true, deletedAt: new Date()}})
            return res.status(200).send({ status: true , messsage:`Product deleted successfully.`})
        } 
        else {
            return res.status(400).send({ status : false , message:`Product has already been deleted!`})
        }


    }catch(err){
        return res.status(500).send({status : false , mesaage:"Error is:"+err})

    }
}
module.exports = {createProduct, getProducts, getProductById, deleteProduct}