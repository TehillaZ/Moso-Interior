const express=require('express')
const router=express.Router();



const ordersController=require('../../controllers/ordersCon ')
const  {authenticateToken,checkAdmin} = require('../../middleware/middleware');

router.route('/user-orders')
  .get(authenticateToken, ordersController.getUserOrders);

router.route('/')
  .get(checkAdmin,ordersController.getAllorders)
  .post(ordersController.CreateNewOrder);


router.route('/:id')
.get(ordersController.getOrder)

module.exports =  router;
