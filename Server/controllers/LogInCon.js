const User=require('../models/userModel')
const Order = require('../models/orderModel');
const bcrypt=require('bcrypt')

const fsPromises=require('fs').promises;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path=require('path')

const LogIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or password not provided" });
    }

    // Find user by unique email
    const foundUser = await User.findOne({ email }).exec();
    if (!foundUser) return res.sendStatus(401); // Unauthorized

    // Check password
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) return res.sendStatus(401); // Unauthorized

    // Create access token and refresh token
    const accessToken = jwt.sign(
      { _id: foundUser._id, email: foundUser.email,fullname: foundUser.fullname,roles: foundUser.roles },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '10m' }
    );

    const refreshToken = jwt.sign(
      { _id: foundUser._id, email: foundUser.email,fullname: foundUser.fullname,roles: foundUser.roles },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '10d' }
    );

    // Save refresh token in DB
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Set refresh token cookie
      res.cookie('jwt', refreshToken, {
      httpOnly: true,   
      sameSite: 'lax', // for HTTPS --  None
      secure: false,    // for HTTPS --  TRUE
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

 
    //  לשנות לזה מתי שמעלים לשרת את הפרוייקט
    //  res.cookie('jwt', refreshToken, {
    //   httpOnly: true,   
    //   sameSite: 'None', // for HTTPS --  None
    //   secure: true,    // for HTTPS --  TRUE
    //   maxAge: 10 * 24 * 60 * 60 * 1000,
    // });
    

    // Respond with minimal user info + access token
    return res.json({
      _id: foundUser._id,
      fullname: foundUser.fullname,
      email: foundUser.email,
      roles: foundUser.roles,
      accessToken
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { LogIn };

