const productModel = require("../models/productModel.js")
const validation = require("../validations/validator.js")
const mongoose = require("mongoose")
const upload = require('../.aws/config.js')




//=====================================  Creating Products  ========================================//

const createProduct = async function (req, res) {

    try{
    let data = req.body;
    let files =req. files;

    let{title, description,  price,  currencyId,  currencyFormat,  isFreeShipping, style, availableSizes,  installments,  } = data

    if (!validation.isValidBody(data)) {
        return res.status(400).send({ status: false, msg: "Please provide data in request body" })
    }

    if(!title) return res.status(400).send({status : false, message : "Title is required!"})
    if (!validation.isValid(title)) {
        return res.status(400).send({ status: false, msg: "Title is invalid!" })
    }
    data.title = data.title.trim().split(" ").filter(word =>word).join(" ")
    let uniquetitle = await productModel.findOne({title :data.title})
    if(uniquetitle) return res.status(400).send({ status: false, msg: "This title already exists, please enter another title." })
   

    if(!description) return res.status(400).send({status : false, message : "Description is required!"})
    if (!validation.isValid(description) ) {
        return res.status(400).send({ status: false, msg: "fname is invalid!" })
    }
    data.description = data.description.trim().split(" ").filter(word => word).join(" ")


    if(!price) return res.status(400).send({status : false, message : "Price is required!"})
    if (!validation.isValid(price) && !validation.isValidPrice(price)) {
        return res.status(400).send({ status: false, msg: "Price is invalid!" })

    }

    if(!currencyId) return res.status(400).send({status : false, message : "Currency Id is required!"})
    if(currencyId != "INR")  return res.status(400).send({ status: false, msg: `Please provide the currencyId as "INR"! ` })
    

    if(!currencyFormat) return res.status(400).send({status : false, message : "Currency Format is required!"})
    if(currencyFormat!="₹")  return res.status(400).send({ status: false, msg: `Please provide the currencyformat as "₹"!` })


    if(!(isFreeShipping=="true" || isFreeShipping=="false")){return res.status(400).send({status:false,msg:"isFreeShipping should either be True, or False."})}


    if (!validation.isValid(style))  {
        return res.status(400).send({ status: false, msg: "Style is invalid" })

    }

    if (!availableSizes) return res.status(400).send({ status: false, message: " 'AvailableSizes' is required!" })
    if (availableSizes) {
        var size = availableSizes.split(" ").filter(a=>a).join("").toUpperCase().split(",") 
      
    }

    for (let i = 0; i < size.length; i++) {
        if (!["S", "XS", "M", "L", "XXL", "XL"].includes(size[i])) {
            return res.status(400).send({ status: false, message: "Size should be one of these - 'S', 'XS', 'M', 'L', 'XXL', 'XL'." })
        }
        data['availableSizes']=size[i].toUpperCase();
    }
    
    if (!validation.isValid(installments) && !validation.isValidPrice(installments)) {
        return res.status(400).send({ status: false, msg: " 'Installments' is invalid." })

    }

    if(!files) return res.status(400).send({status : false, message : "Product Image is required!"})
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










//====================================  Getting Products By Filters  ========================================//

const getProducts = async function (req, res) {
   try{
    let query = req.query
    let { size, name, priceGreaterThan, priceLessThan } = query
    let filter = { isDeleted: false, ...query }

    if (size) {
        let filterSize = size.split(" ").filter(a => a).join("").toUpperCase().split(",")
        for (let i = 0; i < filterSize.length; i++) {
            if (!["S", "XS", "M", "L", "XXL", "XL"].includes(filterSize[i])) {
                return res.status(400).send({ status: false, message: "Size should include 'S', 'XS', 'M', 'L', 'XXL' and  'XL' only." })
            }
             filter['availableSizes'] = filterSize  
        }
}

    if (name){
        if(!validation.isValid(name)) return res.status(400).send({stastus : false, message : "Invalid naming format!"})
        filter['title'] = name
    }

    if(priceGreaterThan){
        if(!validation.onlyNumbers(priceGreaterThan)) return res.status(400).send({status : false, message : "'PriceGreaterThan' should contain only numbers!"})
    filter['price'] = {$gte : priceGreaterThan}
}

     if(priceLessThan){
        if(!validation.onlyNumbers(priceLessThan)) return res.status(400).send({status : false, message : "'PriceLessThan' should contain only numbers!"})
    filter['price'] = {$lte : priceLessThan }
  }
  
    let result = await productModel.find(filter).sort({ price: 1})
    if(result.length == 0) return res.status(404).send({status : false, message : "No such data found!"})
    return res.status(200).send({ status: true, message: "Success", data: result });

}catch(error){
    res.status(500).send({message : error.message})
}
}









//======================================  Getting Products By Id  ====================================//

const getProductById = async function (req,res){
    try{
        let productId = req.params.productId
      if (!validation.idMatch(productId)) return res.status(400).send({ status: false, message: "ProductId is not valid" });

      let getAll = await productModel.findOne({_id : productId, isDeleted : false}).sort("price")
      if(!getAll) return res.status(404).send({status : false, msg : "No product found with this ProductId!"})

      return res.status(200).send({status : true, message : "Success", data : getAll})
    }catch(error){
        res.status(500).send({message : error.message})
    }
}











//=========================================  Updating Products  ======================================//

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        let updateBody = req.body

        let { title, description, price, isFreeShipping, productImage,style, availableSizes, installments } = updateBody

        if (!validation.idMatch) {
            return res.status(400).send({status: false, message: 'Please provide valid product id in Params' })
        }

        let product = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!product) {
            return res.status(404).send({ status: false, message: `ProductId  Does not exists`})
        }


        let files = req.files
        if (files) {
            if (files && files.length > 0) {
                const updateImage = await upload.uploadFile(files[0]);
                updateBody.productImage = updateImage;
            }
        }
        
        if(!validation.isValidBody(updateBody)) {
        return res.status(400).send({status : false, message : "Please update something!"})
        }
        
        if (!validation.validString(title)) {
            return res.status(400).send({ status: false, message: 'Title cannot be empty!'})
        }

        let duplicateTitle = await productModel.findOne({ title: title })

        if (duplicateTitle) {
            return res.status(400).send({status: false,message: 'Title already exists!'})
        }

        if (!validation.validString(description)) {
            return res.status(400).send({status: false,message: 'Description cannot be empty!'
            })
        }

        
        if (!validation.validString(style)) {
            return res.status(400).send({status: false,message: 'Style cannot be empty!'})
        }

        if (!validation.validString(installments)) {
            return res.status(400).send({status: false,message: 'Installments cannot be empty!'})
        }

        if (installments) {
            if (!validation.onlyNumbers(installments)) {
                return res.status(400).send({ status: false,message: 'Enter a valid installment number!'
                })
            }
        }
        if (!validation.validString(price)) {
            return res.status(400).send({status: false,message: 'Price cannot be empty!'})
        }
        
        if(price){
        if (!validation.onlyNumbers(price)) {
            return res.status(400).send({status: false, message: 'Price should be a valid number!'
            })
        }
    }

        if (!validation.validString(isFreeShipping)) {
            return res.status(400).send({ status: false,message: ' "isFreeShipping" cannot be empty' })
        }
        if (isFreeShipping) {
            if (!((isFreeShipping === 'true') || (isFreeShipping === 'false'))) {
                return res.status(400).send({ status: false,message: 'isFreeShipping should be a boolean value'})
            }
        }

        let arr = ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']
        if (availableSizes == 0) {
            return res.status(400).send({status: false,message: 'availableSizes cannot be empty' })
        }
        if (availableSizes) {
            let sizeArr = availableSizes.split(',').map(x => x.trim())
            for (let i = 0; i < sizeArr.length; i++) {
                if (!(arr.includes(sizeArr[i]))) {
                    return res.status(400).send({ status: false, message: `availableSizes should be among [${arr}]`
                    })
                }
            }
            updateBody.availableSizes = sizeArr
        }

        let updatedProduct = await productModel.findOneAndUpdate({ _id: productId },
            {
                $set:
                {
                    title: title,
                    description: description,
                    price: price,
                    isFreeShipping: isFreeShipping,
                    style: style,
                    availableSizes: availableSizes,
                    productImage: updateBody.productImage,
                    installments: installments
                }
           }, { new: true })
        return res.status(200).send({ status: true, message : "Success!", data : updatedProduct })
    }
    catch (error) {
        return res.status(500).send({status: false,error: error.message})
    }
}










//========================================  Deleting Products  =========================================//

const deleteProduct= async function(req,res){
    try{
        let productId = req.params.productId
        if (!validation.idMatch(productId)) return res.status(400).send({ status: false, message: "ProductId is not valid!" });
        
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
module.exports = {createProduct, getProducts, getProductById, updateProduct, deleteProduct}