const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User=require('../models/userModel')
const Order=require('../models/orderModel')
const bcrypt=require('bcrypt');
const { LogIn } = require('./LogInCon');
const nodemailer = require("nodemailer");

 const getAllorders = async(req, res) => {
     try {
             const orders = await Order.find();  // Store the result in a variable
     
             if (!orders || orders.length === 0) {  // Check if users array is empty
                 return res.status(404).json({"message": "no orders found"});
             }
             
             res.json(orders);  // Respond with the list of users
         } catch (error) {
             console.error(error);
             res.status(500).json({ message: "An error occurred while retrieving orders" });
         }
    };

const CreateNewOrder = async(req, res) => {
  try {     
    const { email, products, finalPrice } = req.body;
        
    if (!email || !products || !finalPrice) {
      return res.status(401).send({ message: "email, products array and finalPrice are required" });
    }


    const NewOrder = new Order({           
      email: email,
      products: products,
      finalPrice: finalPrice 
    });
        
    await NewOrder.save();

    // 📧 send email
    const transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      ignoreTLS: true
    });

        const now = new Date(); 
         const formattedTime = now.toLocaleString();

   
     await transporter.sendMail({
      from: "no-reply@localhost",
      to: email,
      subject: `Order Confirmation `,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Order ID: ${NewOrder._id}</p>
        <p>Total: $${finalPrice}</p>
        <p>The order recieved at ${formattedTime}</p>
        <p>Your order is being pending..</p>
        <p>For view order enter the site -> Moso Interior - design your Home</p>
        <p>For cancel order or any other questions conact us with:</p>
        <p>📞 090-080-0760</p>
        <p>💻 info@company.com</p>
      `
    });

    res.json(NewOrder);
  } catch (error) { 
    console.log(error);
    res.status(500).json({ message: "failed to create new order" });
  }
};

 const getOrder = async(req, res) => {

      const id = req.params.id; 
      const order = await Order.findById(id).exec();
    console.log("Requested ID:", id);
  
      if (!order) {
        return res.status(404).json({ message: `No user found with ID ${req.params.id}` });
      }
    
      res.json(order);
    };

const getUserOrders = async (req, res) => {

  try {
    const userEmail = req.userEmail;
    console.log(userEmail);
    
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized: no user email found" });
    }

    const orders = await Order.find({ email: userEmail })
      .populate('products.productId', 'name price');

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    console.log(JSON.stringify(orders, null, 2));
    
    res.json(orders);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

  module.exports={
    CreateNewOrder,
    getAllorders,
    getOrder,
    getUserOrders
  }
  




  
  