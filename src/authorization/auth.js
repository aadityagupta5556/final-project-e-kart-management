const userModel = require('../models/userModel.js')
const jwt =require("jsonwebtoken");
const mongoose=require("mongoose")


const authentication = function(req,res,next)
{
    try{
    let token = req.header("Authorization","Bearer Token");
    

    if(!token)return res.status(401).send({status:false, message:"Please enter token in bearer token"});
    let splittoken=token.split(" ")

        jwt.verify(splittoken[1],"group58",(error)=>{
            if(error){
            const message =error.message==="jwt expired" ?"token is expired plz login again" :"plz rechecked your token "
            return res.status(401).send({status:false, message});
            }
       
            next();
         });
    }
    catch(error){
        res.status(500).send({status:false, message:error.message});

    }
}





const authorization= async function(req,res,next){
    try{
    let token = req.header("Authorization","Bearer Token");
    let splittoken=token.split(" ")
    let decodedtoken= jwt.verify(splittoken[1],"group58")
    let userId=req.params.userId
    
    if(!mongoose.isValidObjectId(userId)) return res.status(400).send({status :false,message: "userId is invalid"});

    let user=await userModel.findOne({_id:userId})
    if(!user)return res.status(400).send({status :false,message: "user doesnot exist with this id"});
    if(decodedtoken.userId!=user._id)return res.status(403).send({status :false,message: "unauthorized acess"});

    next()
    }
    catch(error){
        res.status(500).send({status:false, message:error.message});

    }
}

module.exports = {authentication, authorization}