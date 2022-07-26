const userModel = require('../models/userModel.js')
const bcrypt = require('bcrypt');

const bcryptPass = async function (req, res, next) {
    try {
        let email = req.body.email
        let password = req.body.password;

        let checkEmail = await userModel.findOne({ email: email })
        let hash = checkEmail.password
        let compare = bcrypt.compareSync(password, hash)

        if (!compare) return res.status(400).send({ status: false, msg: "Password Incorrect" })

        next()
    } catch (err) {
        res.status(500).send({ status:false, msg: err.message })
    }
}
module.exports={

    bcryptPass
}