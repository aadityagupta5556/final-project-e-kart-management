const userModel = require('../models/userModel')
const aws = require("aws-sdk")
const bcrypt = require('bcrypt');
const upload = require('../.aws/config')
const mongoose = require('mongoose');
const validation = require("../validations/validator.js")
const passValidator = require("password-validator")




const createUser = async function (req, res) {
   try{
    let data = req.body;

    const { fname, lname, email, phone, password, address } = data;

    if (!validation.isValidBody(data)) {
        return res.status(400).send({ status: false, msg: "Please provide data in request body" })
    }
    if (!validation.isValid(fname) && !validation.alphabetTestOfString(fname)) {
        return res.status(400).send({ status: false, msg: "fname is invalid" })
    }
    if (!validation.isValid(lname) && !validation.alphabetTestOfString(lname)) {
        return res.status(400).send({ status: false, msg: "lname is invalid" })
    }
    if (!validation.isValid(email) && !validation.isValidSyntaxOfEmail(email)) {
        return res.status(400).send({ status: false, msg: "Email is invalid" })
    }
    let userEmail = await userModel.find({ email: data.email })
    if (userEmail.length !== 0)
        return res.status(401).send({ status: false, msg: "This email address is already exists, please enter valid email address" })

    if (!validation.isValid(phone) && !validation.isValidMobileNum(phone)) {
        return res.status(400).send({ status: false, msg: "Phone is invalid" })
    }
    let userNumber = await userModel.find({ phone: data.phone })
    if (userNumber.length !== 0)
        return res.status(401).send({ status: false, msg: "This phone number is already exist , Please enter another phone number" })

    if (!validation.isValidPassword(password)) {
        return res.status(400).send({ status: false, msg: "Password should be strong please use One digit, one upper case, one lower case, one special character" })
    }

    const salt = await bcrypt.genSalt(10)
    data.password = await bcrypt.hash(data.password, salt)



    if (!validation.isValid(address.shipping.street)) {
        return res.status(400).send({ status: false, msg: "Please provide street" })
    }
    if (!validation.isValid(address.shipping.city)) {
        return res.status(400).send({ status: false, msg: "Please provide city name" })
    }
    if (!validation.isValidPinCode(address.shipping.pincode)) {
        return res.status(400).send({ status: false, msg: "Please provide valid pincode" })
    }
    if (!validation.isValid(address.billing.street)) {
        return res.status(400).send({ status: false, msg: "Please provide street" })
    }
    if (!validation.isValid(address.billing.city)) {
        return res.status(400).send({ status: false, msg: "Please provide city name" })
    }
    if (!validation.isValidPinCode(address.billing.pincode)) {
        return res.status(400).send({ status: false, msg: "Please provide valid pincode" })
    }

    let files = req.files
    if (files && files.length > 0) {
      
        let uploadedFileURL = await upload.uploadFile(files[0])
      
        data.profileImage = uploadedFileURL;
    }
    else {
        res.status(400).send({ msg: "No file found" })
    }
    const document = await userModel.create(data)
    res.status(201).send({ status: true, data: document })
}catch(error){
    res.status(500).send({message : error.message})
}
}






const loginUser = async function (req, res) {
    try {

        let email = req.body.email;
        let password = req.body.password;

        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, Msg: "Body cannot be empty" })
        }

        if (!password) {
            return res.status(400).send({ status: false, message: "Password is required" })
        }
        let user = await userModel.findOne({ email: email});
        if (!user) {
            return res.status(401).send({ status: false, message: "Email Is incorrect" });
        }

        let iat = Math.floor(Date.now() / 1000)
        let exp = iat + (60 * 60)
        let token = jwt.sign(
            { _id: email._id, 
            iat: iat, 
            exp: exp 
        }, "group58");
        res.setHeader("x-api-key", token);

        res.status(201).send({status: true, message: "User login successfull",data: {userId:user._id,token: token}});

    } catch (err) {
        res.status(500).send({ staus: false, msg: err.message })
    }
}



const getUser = async function (req, res) {
    try {
        const userParams = req.params.userId.trim()
        //validating userId
        if (!validation.userIdMatch(userParams)) {
            return res.status(400).send({ status: false, message: "Inavlid userId Please enter a correct objectId" })
        }
        //finding user in db
        const findUser = await userModel.findOne({ _id: userParams })
        if (!findUser) {
            return res.status(404).send({ status: false, message: `User does not exist.` })
        }
        //Authorization
        if ((userParams == req.userId)) { 
            return res.status(200).send({ status: true, msg: "User profile details", data: findUser })

        }
        else {
            return res.status(403).send({ Status: false, msg: "User not authorized to access requested id" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}






    


    const updateUser = async function (req, res){
        try{
            let userId = req.params.userId
            let data = req.body
            let {fname, lname, email, profileImage, phone, password} = data
    
            let address = req.body.address
            let shipping = address.shipping
            // let shippingStreet = shipping.street  //...address
            // let shippingCity = shipping.city
            let shippingPincode = shipping.pincode
    
            let billing = address.billing
            // let billingStreet = billing.street
            // let billingCity = billing.city
            let billingPincode = billing.pincode
    
            if(validation.isEmpty(data)) return res.status(400).send({status : false, message : "Please update something!" })
    
            let uniqueEmail = await userModel.findOne({email : email})
            if(uniqueEmail) return res.status(409).send({status : false, message : "This email already exists!"})
            if(!validation.validateEmail(email)) return res.status(400).send({status : false, message : "This email is invalid!"})
    
            let uniquePhone = await userModel.findOne({phone : phone})
            if(uniquePhone) return res.status(409).send({status : false, message : "This phone number already exists!"})
            if(!validation.isValidMobileNum(phone)) return res.status(400).send({status : false, message : "This ain't an Indian mobile number!"})
    
            const schema = new passValidator();
            schema.is().min(8)
            if (!schema.validate(password)) {
            return res.status(400).send({ status: false, msg: "Minimum length of password should be 8 characters!" })
    }
    
           schema.is().max(15)
           if (!schema.validate(password)) {
           return res.status(400).send({ status: false, msg: "Max length of password should be 15 characters only!" })    
    }
    
           if(!validation.isValidPinCode(shippingPincode)) return res.status(400).send({status : false, message : "The pincode provided are invalid!"})
           if(!validation.isValidPinCode(billingPincode)) return res.status(400).send({status : false, message : "The pincode provided are invalid!"})
    
           let update = await userModel.findOneAndUpdate({_id : userId},
           {$set: {fname:fname, lname:lname, email:email, profileImage:profileImage, phone:phone, password:password, address : address}}, {new : true})
           res.status(200).send({status : true, message : "Data updated successfully!", data : update})
    
        }catch(error){
            res.status(500).send({message : error.message})
        }
    }


module.exports ={createUser, loginUser, getUser, updateUser}