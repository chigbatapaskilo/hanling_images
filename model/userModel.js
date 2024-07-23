const { type } = require('@hapi/joi/lib/extend');
const mongoose=require('mongoose');

const userSchema=new  mongoose.Schema({
name:{
    type:String,
    require:true
},
stack:{
    type:String,
    require:true
},
password:{
    type:String,
    require:true
},email:{
    type:String,
    require:true,
    unique:true
},
photos:[{
    type:String,
    require:true
}],
isVerified:{
    type:Boolean,
    default:false

}
    

},{timestamps:true})
const userModel=mongoose.model('uploading_multiple_image',userSchema);
module.exports=userModel