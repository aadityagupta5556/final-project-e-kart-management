const JWT = require("jsonwebtoken")
const userModel = require("../models/userModel")

const authorize= async function(req,res,next){
    try{
        const btoken = req.headers.authorization
        let token = btoken.split(" ")[1]
        let userId = req.params.userId

        if(!token) return res.status(400).send({status: false, msg : "Please provide a token!"})

        let decodedToken = JWT.verify(token, "Group-58")
        if(!decodedToken) return res.status(400).send({status : false, msg : "Token should be present!"})

        let userLoggedIn = decodedToken.userId

        let findUserId = await userModel.findById(userId)
        if(!findUserId) return res.status(404).send({status : false, msg : "No book found with this bookId"})

        let newUserId = findUserId.userId.toString()


        if(userLoggedIn !== newUserId) return res.status(401).send({status : false, msg : "You're not authorized!"})

        next()


        
    }catch(error){
        res.status(500).send({status:false ,message:error})
    }
}

module.exports = {authorize}