const mongoose = require("mongoose");
const userModel =require('../Model/userModel');
const upload = require('../.aws/config');


const createUser = async function (req, res){

    let data =req.body;
    let files = req.files;
    let uploadedFileURL;
    

    if(files && files.length>0){
        uploadedFileURL = await upload.uploadFile(files[0]);
     }
     data['profileImage'] = uploadedFileURL


    let save =await userModel.create(data);
    res.send({status:true, data:save});
}
module.exports ={
      createUser}