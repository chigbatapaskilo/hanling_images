const mongoose=require('mongoose');
require('dotenv').config();
const Url=process.env.DATABASE
mongoose.connect(Url)
.then(()=>{
    console.log('connection to database successful');
})
.catch((error)=>{
    console.log('unable to connect to database because '+error.message);
})