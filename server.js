const express=require('express')
require('./config/db')
const app=express();
const router=require('./router/router')
app.use(express.json());
app.use('/uploads',express.static('uploads'))
app.use('/api/v1/user',router)
const PORT=process.env.PORT||2025
app.listen(PORT,()=>{
    console.log(`app is listening to port:${PORT}`);
})