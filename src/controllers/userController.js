const userModel = require('../Model/userModel')
const aws = require("aws-sdk")
const bcrypt = require('bcrypt');
const validator = require("email-validator");
const upload = require('../.aws/config')
const mongoose = require('mongoose');


//--------------------------------------------------------------------------//

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
};

const isValidBody = function (data) {
    return Object.keys(data).length > 0;
};


let alphabetTestOfString = function (value) {
    let regex = /^[a-zA-Z\\s]{2,10}$/;
    if (regex.test(value)) {
        return true;
    }
    return false;
};

const isValidSyntaxOfEmail = function (value) {
    if (validator.validate(value.trim())) {
        return true;
    }
    return false;
};

const isValidMobileNum = function (value) {
    if (/^[6-9]\d{9}$/.test(value)) {
        return true;
    }
    return false;
};

const isValidPinCode = (value) => {
    const regEx = /^\s*([0-9]){6}\s*$/
    const result = regEx.test(value)
    return result
}
const isValidPassword = function (value) {
    const passwordregex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (passwordregex.test(value)) {
        return true;
    }
    return false;
};

const validateEmail = function (mail) {
    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(mail)) {
        return true;
    }
}



//--------------------------------------------------------------------------//

const createUser = async function (req, res) {

    let data = req.body;

    const { fname, lname, email, phone, password, address } = data;

    if (!isValidBody(data)) {
        return res.status(400).send({ status: false, msg: "please provide data in request body" })
    }
    if (!isValid(fname) && !alphabetTestOfString(fname)) {
        return res.status(400).send({ status: false, msg: "fname is invalid" })
    }
    if (!isValid(lname) && !alphabetTestOfString(lname)) {
        return res.status(400).send({ status: false, msg: "fname is invalid" })
    }
    if (!isValid(email) && !isValidSyntaxOfEmail(email)) {
        return res.status(400).send({ status: false, msg: "email is invalid" })
    }
    let userEmail = await userModel.find({ email: data.email })
    if (userEmail.length !== 0)
        return res.status(401).send({ status: false, msg: "This e-mail address is already exist , Please enter valid E-mail address" })

    if (!isValid(phone) && !isValidMobileNum(phone)) {
        return res.status(400).send({ status: false, msg: "phone is invalid" })
    }
    let userNumber = await userModel.find({ phone: data.phone })
    if (userNumber.length !== 0)
        return res.status(401).send({ status: false, msg: "This phone number is already exist , Please enter another phone number" })

    if (!isValidPassword(password)) {
        return res.status(400).send({ status: false, msg: "password should be strong please use One digit, one upper case , one lower case ,one special character" })
    }

    const salt = await bcrypt.genSalt(10)
    data.password = await bcrypt.hash(data.password, salt)



    if (!isValid(address.shipping.street)) {
        return res.status(400).send({ status: false, msg: "please provide street" })
    }
    if (!isValid(address.shipping.city)) {
        return res.status(400).send({ status: false, msg: "please provide city name" })
    }
    if (!isValidPinCode(address.shipping.pincode)) {
        return res.status(400).send({ status: false, msg: "please provide valid pincode" })
    }
    if (!isValid(address.billing.street)) {
        return res.status(400).send({ status: false, msg: "please provide street" })
    }
    if (!isValid(address.billing.city)) {
        return res.status(400).send({ status: false, msg: "please provide city name" })
    }
    if (!isValidPinCode(address.billing.pincode)) {
        return res.status(400).send({ status: false, msg: "please provide valid pincode" })
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
}

module.exports ={
    createUser
}