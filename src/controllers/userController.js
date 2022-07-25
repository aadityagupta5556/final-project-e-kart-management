const bcrypt = require("bcrypt");
const userModel =require('../Model/userModel');
const upload = require('../.aws/config');
const validations=require('../validations/validator')

const createUser = async function (req, res){

    let data =req.body;
    const {fname,lname,email,phone,password,address,}=data;
    
     if(!validations.isValidBody(data)){
     return res.status(400).send({status:false,msg:"please provide data in request body"})
    }
    if(!validations.isValid(fname)&&!stringformat(fname)){
        return res.status(400).send({status:false,msg:"fname is invalid"})
    }
    if(!validations.isValid(lname)&&!stringformat(lname)){
        return res.status(400).send({status:false,msg:"fname is invalid"})
    }
    if(!validations.isValid(email)&&!isValidSyntaxOfEmail(email)){
        return res.status(400).send({status:false,msg:"email is invalid"})
    }

    let userEmail = await userModel.find({ email: data.email })
        if (userEmail.length !== 0)
            return res.status(401).send({ status: false, msg: "This e-mail address is already exist , Please enter valid E-mail address" })

    if(!validations.isValid(phone)&&!isValidMobileNum(phone)){
        return res.status(400).send({status:false,msg:"phone is invalid"})
    }
    let userNumber = await userModel.find({ phone: data.phone })
        if (userNumber.length !== 0)
            return res.status(401).send({ status: false, msg: "This phone number is already exist , Please enter another phone number" })

    if(!validations.isValidPassword(password)){
        return res.status(400).send({status:false,msg:"password should be strong please use One digit, one upper case , one lower case ,one special character, its b/w 8 to 15"})
    }

     const salt = await bcrypt.genSalt(10)
     data.password = await bcrypt.hash(data.password, salt)
 
   
    
    if(!validations.isValid(address.shipping.street)){
        return res.status(400).send({status:false,msg:"please provide street"})
    }
    if(!validations.isValid(address.shipping.city)){
        return res.status(400).send({status:false,msg:"please provide city name"})
    }
    if(!validations.isValidPinCode(address.shipping.pincode)){
        return res.status(400).send({status:false,msg:"please provide valid pincode"})
    }
    if(!validations.isValid(address.billing.street)){
        return res.status(400).send({status:false,msg:"please provide street"})
    }
    if(!validations.isValid(address.billing.city)){
        return res.status(400).send({status:false,msg:"please provide city name"})
    }
    if(!validations.isValidPinCode(address.billing.pincode)){
        return res.status(400).send({status:false,msg:"please provide valid pincode"})
    }


    //getting file uploaded link

    
    let files = req.files
    if(files && files.length>0){
        
        let uploadedFileURL= await upload.uploadFile( files[0] )
        res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        data.profileImage=uploadedFileURL;
    }
    else{
        res.status(400).send({ msg: "No file found" })
    }


    let save =await userModel.create(data);
    res.send({status:true, data:save});
}
module.exports ={
      createUser}