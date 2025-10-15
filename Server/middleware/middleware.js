
//middleware use to check the req before we send the answer/res
//there are build in functions when we use express like:
//1 express.json()   ----  this check if the file is json and parse it to json
//2 express.static() ---- this is good for images,css pages for static files
//3 express.urlencoded() ---- this is when you get details from page of html and you want to get the name 
//and so on you use it
//4 express.Router() --- it helps with routs when you have user and on the user there are som actions 
//you can make special router for all


 const express = require('express');
 const app = express();
 //3
 app.use(express.urlencoded({ extended: true }));
 //2
 app.use('/',express.static('public'));
 //1
 app.use(express.json());

 const jwt=require('jsonwebtoken')


  const checkAdmin = (req, res, next) => {

    console.log(req.user.roles);
    
  if (!req.user.roles || !req.user.roles.includes('admin')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};


const decodedToken = (token) => {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const { _id, email } = decoded;
  return { _id, email };
}



const authenticateToken = (req, res, next) => {
 
  const token = req.cookies.jwt;

  console.log('Token from cookie:', token);

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.error('Token verification failed:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    req.userEmail = user.email;
    req.userFullname = user.fullname;
    console.log(req.user);
     console.log("hey");
    next();
  });
};



module.exports={decodedToken,authenticateToken,checkAdmin};

