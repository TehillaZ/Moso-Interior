const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User=require('../models/userModel')
const Order=require('../models/orderModel')
const bcrypt=require('bcrypt')

  

  const getAllusers = async (req, res) => {
    try {
        const users = await User.find(); 
       
        

        if (!users || users.length === 0) {  
            return res.status(404).json({"message": "no users found"});
        }
        
        res.json(users);  
    } catch (error) {
        console.error(error);
        res.status(500).json({ "message": "An error occurred while retrieving users" });
    }
};
 
  const CreateNewUser = async (req, res) => {
    try {     
        const { fullname, address
          , roles,phone, email, password } = req.body;

        if (!fullname || !address || !phone) {
            return res.status(401).json({ "message": "fullname, address, phone are required " });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        const Newuser = new User({
            fullname: fullname,
            address: address, 
            roles: roles,                     
            phone: phone,        
            email: email,
            password: hashedPassword
        });
        
        await Newuser.save();

        const payload = {
            _id: Newuser._id, 
            email: Newuser.email,
            roles: Newuser.roles
          };

        const token = generateToken(payload);
        
        res.status(201).json({
            message: 'User created successfully',
            token: token,
            user: Newuser
        }); 
              
    } catch (error) { 
        console.log(error);
        res.status(500).json({ message: "failed to create new user" });
        
    }
};

 const generateToken = (payload) => {
  
  const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });

  return token;
};


const updateUser = async (req, res) => {
  try {
    
    const userId = req.params.id;

    // Check if the logged-in user from JWT req.user._id = user id from JWT matches the user being updated which i get in URL
    if (req.user._id !== userId) {
      return res.status(403).json({ message: 'You can only update your own account' });
    }


    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update only the allowed fields if they exist in the request body
    const { fullname, email, phone, address, password, roles } = req.body;
    if (fullname !== undefined) user.fullname = fullname;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (roles !== undefined) user.roles = roles;


    // for password needs  hash before saving
    if (password !== undefined) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
}

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update user' });
  }
};


  const deleteUser = async(req, res) => {
        try{
          if(!req.body.password)
            return res.status(400).json({"message":"password is required"})
         
          const user = await User.findOne({ _id: req.body._id }).exec();
        if (!user) {
            return res.status(400).json({ "message": `the user id ${req.body._id} wasnt found` });
        }
       
        const result=await user.deleteOne({_id:req.body._id})
            res.json(result)
    }
    catch(err){
      console.log(err);
      res.status(400).json({"message":"failed to delete user"})

    }
  };
  
  
  const getUser = async(req, res) => {
    
    const id = req.params.id; 
    const user = await User.findById(id).exec();
  

    if (!user) {
      return res.status(404).json({ message: `No user found with ID ${req.params.id}` });
    }
  
    res.json(user);
  };
  
  module.exports = {
    getAllusers,
    CreateNewUser,
    updateUser,
    deleteUser,
    getUser
  };