const userModel=require('../model/userModel');
const sendMail=require('../helpers/email');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const { htmlFile, verifyTemplate, forgetPasswordtemplate } = require('../helpers/html');
const fs=require('fs');

exports.signUp=async(req,res)=>{
    try {
        const {name,stack,email,password}=req.body
        const existingUser=await userModel.findOne({email})
        if(existingUser){
            return res.status(400).json('user with email already exist')
        }
        const saltedRound=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,saltedRound)
        const user=new userModel({
            name,
            stack,
            email,
            password:hashedPassword,
            photos:req.form
        })
        const token=jwt.sign({id:user._id,
            email:user.email
        },process.env.JWT_SECRET,{expiresIn:'20mins'})
        const verifyLink=`${req.protocol}://${req.get("host")}/api/v1/verify/${user._id}/${token}`
        const mailoption={
            email:user.email,
            subject:`verify email`,
            html:htmlFile(verifyLink,user.name)

        }
        await user.save()
        await sendMail(mailoption)
        res.status(201).json({message:`user created successfully`,
            data:user
        })

    } catch (error) {
        res.status(500).json(error.message)
    }
}
exports.verifyMail=async(req,res)=>{
    try {
        const {token}=req.params
        const {email}=jwt.verify(token,process.env.JWT_SECRET)
        const user=await userModel.findOne({email})
        if(!user){
            return res.status(404).json('user not found .')
        }
        if(user.isVerified){
            return res.status(400).json('user already verified.')
        }
        user.isVerified=true
        await user.save()
        res.status(200).json({meassage :'user verification successful'})
    } catch (error) {
        res.status(500).json(error.message)
    }
}
exports.resendVerification=async(req,res)=>{
    try {
        const {email}=req.body
        const user=await userModel.findOne({email})
        if(!user){
            return res.status(404).json('user not found')
            
        }
        console.log(user.email);
        const token=jwt.sign({id:user._id,
            email:user.email
        },process.env.JWT_SECRET,{expiresIn:'10mins'})
        const verifyLink=`${req.protocol}://${req.get('host')}/api/v1/user/verify-user/${token}`
       
        const mailoption={
            email:user.email,
            subject:`revification link`,
            html:verifyTemplate(verifyLink,user.name)
        }
        await sendMail(mailoption)
        res.status(200).json('check your email for verification.')
    } catch (error) {
        res.status(500).json(error.message)
    }
}
exports.login=async(req,res)=>{
    try {
        const {email,password}=req.body
        const user=await userModel.findOne({email})
        console.log(user.password)
        if(!user){
            return res.status(400).json('user with email not found.')
        }
            const checkPassword=await bcrypt.compare(password,user.password)
        if(!checkPassword){
            return res.status(400).json('incorrect password.')
        }
            if(!user.isVerified){
                return res.status(400).json('user has not verified email verify to login.')
            }
            const token=jwt.sign({id:user._id,
                email:user.email
            },process.env.JWT_SECRET,{expiresIn:'10h'})
            res.status(200).json({
                message:'login successful',
                token
            })
        
       
        
        
    } catch (error) {
        res.status(500).json(error.message)
    }
}
exports.oneUser=async(req,res)=>{
    try {
        const {id}=req.params
        const oneUser=await userModel.findById(id)
        if(!oneUser){
            res.status(404).json('user not found')
        }
        res.status(200).json({
            message:`get the user with the id:${id}`,
            data:oneUser
        })
    } catch (error) {
        res.status(500).json(error.message)
    }
}
exports.allUsersDetails=async(req,res)=>{
    try {
        const alluser=await userModel.find()
        if(alluser.length <=0){
        return res.status(404).json({
            message:'no registered users'
        })
        }
        res.status(200).json({
            message:`get total ${alluser.length} users in database`,
        data:alluser
    })
    } catch (error) {
        res.status(500).json(error.message)
    }
}
exports.updateUserDetails=async(req,res)=>{
    try {
        const {id}=req.params
        const {name,stack}=req.body
        const user=await userModel.findById(id)
        if(!user){
            return res.status(404).json('user not found')
        }
        const data={
            name:name||user.name,
            stack:stack||user.stack,
            photos:user.photos
        }
        if(req.file && req.form.file){
            const oldPath=`uploads/${user.photos}`
            if(fs.existsSync(oldPath)){
               fs.unlinkSync(oldPath)
               data.photos=req.file
            }
        }
        const updateUser=await userModel.findByIdAndUpdate(id,data,{new:true})
        res.status(200).json({
            message:`user details updated successfully`,
            data:updateUser
        })

    } catch (error) {
        res.status(500).json(error.meassage)
    }
}
exports.forgetPassword=async(req,res)=>{
    try {
        const {email}=req.body
        const user=await userModel.findOne({email})
        if(!user){
            return res.status(404).json('user not found')
        }
        const passwordtoken=jwt.sign({email:user.email},process.env.JWT_SECRET,{expiresIn:'10mins'})
        const verifyLink=`${req.protocol}//:${req.get('host')}/api/v1/user/reset-password/:${passwordtoken}`
        const mailoption={
            email:user.email,
            subject:'reset password link',
            html:forgetPasswordtemplate(verifyLink,user.name)
        }
        await sendMail(mailoption)
        res.status(200).json('check your email for a link to reset password')
    } catch (error) {
        res.status(500).json(error.message)
    }
}
exports.resetPassword=async(req,res)=>{
    try {
        const {token}=req.params
        const {password}=req.body
        const {email}=jwt.verify(token,process.env.JWT_SECRET)
        const user=await userModel.findOne({email})
        if(!user){
            return res.status(404).json('user not found.')
        }
        const saltedRound=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,saltedRound)
        user.password=hashedPassword
        await user.save()
        res.status(200).json('password reset successfully')

    } catch (error) {
        return res.status(500).json(error.message)
    }
}
exports.changePassword=async(req,res)=>{
    try {
        const {token}=req.params
        const {oldPassword,password}=req.params
        const {email}=jwt.verify(token,process.env.JWT_SECRET)
        const user=await userModel.findOne({email})
        if(!user){
return res.status(404).json('user not found')
        }
        const decodePassword=await bcrypt.compare(oldPassword,user.password)
        if(!decodePassword){
            return res.status(400).json('password does not match previous password')
        }
        const saltPassword=await bcrypt.genSalt(10);
        const hashPassword=await bcrypt.hash(password,saltPassword)
        user.password=hashPassword
        await user.save()
        res.status(200).json('password changed successfully')

    } catch (error) {
        res.status(500).json(error.message)
    }
}