
const express=require('express')
const router=express.Router()

const loginpage=require('../../controllers/LogInCon')

router.route('/')
.post(loginpage.LogIn)


module.exports=router;