const express=require('express')
const router=express.Router();


const  {authenticateToken,checkAdmin} = require('../../middleware/middleware');

const usersController=require('../../controllers/usersCon')

router.route('/')
.get(authenticateToken,checkAdmin,usersController.getAllusers)
.post(usersController.CreateNewUser)
.delete(authenticateToken,checkAdmin,usersController.deleteUser)

router.route('/:id')
.get(usersController.getUser)
.put(usersController.updateUser)

module.exports = router;
