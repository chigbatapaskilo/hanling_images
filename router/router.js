const upload=require('../utils/multer');
const { signUp, verifyMail, resendVerification, login, forgetPassword, resetPassword, updateUserDetails, allUsersDetails, oneUser }=require('../controller/userController')
const router=require('express').Router()
router.post('/sign-up',upload.array('photos',5),signUp)
router.get('/verify-user/:token',verifyMail)
router.post('/reverify-user',resendVerification)
router.post("/login-user",login)
router.post('/forget-password',forgetPassword)
router.post('/reset-password/:token',resetPassword)
router.post('/update-user/:id',upload.array('photos',5),updateUserDetails)
router.get('/all',allUsersDetails)
router.get('/oneuser',oneUser)
module.exports=router