
const dotenv=require('dotenv')
const fs=require('fs');
const path=require('path');
const express=require('express');
const cors=require('cors');
const multer = require('multer');
 const jwt = require('jsonwebtoken');
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Order = require('./models/orderModel');
const cookieParser=require('cookie-parser')
const app=express();
const mongoose=require('mongoose');
dotenv.config()
mongoose.connect(process.env.DB_CONNECT)
.then(()=>{
  console.log('connected to mongoDB'); 
}).catch((err)=>console.log(err));

const port=process.env.PORT;

const logsDirectory = path.join(__dirname, 'logs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const { authenticateToken }  = require('./middleware/middleware')
const authRoutes = require("./routes/api/auth");
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:5501',
  'http://localhost:3284'
];

//FOR PICTURES
app.use(express.static(path.join(__dirname, '../Client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//WHICH ORIGONS TO LET
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS"));
    }
  },
  credentials: true
}));

const refreshRoute = require('./routes/api/refreshJWT');
app.use('/refresh', refreshRoute);

app.use(cookieParser());

// session middleware
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // אם לא HTTPS
}));

// initialize passport
app.use(passport.initialize());
app.use(passport.session());


app.use('/users',require('./routes/api/users'))
app.use('/order',authenticateToken,require('./routes/api/orders'))
app.use('/product',authenticateToken,require('./routes/api/product'))
app.use('/login',require('./routes/api/logIn'))
const cartRoutes = require("./routes/api/cart");
app.use("/cart",authenticateToken, cartRoutes);
app.use("/auth", authRoutes);

//GET THE CURRENT USER FROM COOKIES
app.get("/current-user", (req, res) => {
  const token = req.cookies?.jwt; // read cookie

  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
     console.log(decoded);
     
    res.json({
      email: decoded.email,
      fullname: decoded.fullname,
      id: decoded._id, 
    });

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// PICTURES
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
   
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // req.file.path -> הנתיב של התמונה
    const imageUrl = '/' + req.file.path;

    // שמירה ב-DB (לדוגמה למודל Product)
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      imageUrl: imageUrl
    });

    await newProduct.save();
    res.json({ message: 'Uploaded successfully', product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// END PICTURES


// MANAGER - FOR MANAGER DASHBOARD
app.get('/api/summary', async (req, res) => {
  try {
    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total revenue
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$finalPrice" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Sales by month
    const monthlySalesAgg = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$orderDate" },
          total: { $sum: "$finalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    const months = monthlySalesAgg.map(m => `Month ${m._id}`);
    const monthlySales = monthlySalesAgg.map(m => m.total);

     

    // Orders by category
   const categoriesAgg = await Order.aggregate([
  { $unwind: "$products" }, // separate each product in orders
  {
    $lookup: {
      from: "products",             // your Product collection
      localField: "products.productId",
      foreignField: "_id",
      as: "productInfo"
    }
  },
  { $unwind: "$productInfo" },     // flatten the joined product info
  {
    $group: {
      _id: { $ifNull: ["$productInfo.category", "Uncategorized"] }, // default if no category
      count: { $sum: 1 }  // count products in this category
    }
  },
  { $sort: { _id: 1 } }           // optional: sort categories alphabetically
]);

// Now you can use these arrays for your Pie Chart
const categories = categoriesAgg.map(c => c._id);
const categoryData = categoriesAgg.map(c => c.count);

console.log(categories, categoryData);

    res.json({
      totalOrders,
      totalRevenue,
      months,
      monthlySales,
      categories,
      categoryData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// END MANAGER


//GOOGLE LOG IN
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3284/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"));
});

app.get("/html/profile.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/html/profile.html"));
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/html/profile.html");
  }
);

app.get("/profile", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello ${req.user.displayName}`);
  } else {
    res.redirect("/");
  }
});
//END GOOGLE LOG IN

//UPDATE PRODUCTS BY MANAGER
const Product=require('./models/productsModel')
app.put('/products/stock', async (req, res) => {
  try {
    console.log('Received PUT /product/stock');
    const { _id, productId, stock } = req.body;
    console.log(req.body);

    if ((!_id && !productId) || stock == null) {
      return res.status(400).json({ message: 'Missing product ID or stock value' });
    }

   
    let product;
    if (_id) {
      product = await Product.findById(_id);
    } else if (productId) {
      product = await Product.findOne({ productId });
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    
    product.stock = stock;
    await product.save();

    res.json({ message: 'Stock updated successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/products/price/:id', async (req, res) => {
  const productId = req.params.id;
  const newPrice = req.body.price;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { price: newPrice },
      { new: true }
    );

    res.json({
      message: 'Price updated successfully',
      product: updatedProduct
    });
      
}   
   catch (error) {
    console.error('Error updating price:', error);
    res.status(500).json({ error: 'Failed to update price' });
  }
});


// CATCH MISTAKES
app.use((req,res,next) => {
  res.header("Access-Control-Allow-Origin", "*");
const message=`request  ${req.method}  ${req.url}  ${new Date().toISOString()} \n`

fs.appendFile(path.join(logsDirectory,'req.txt'),message,(err)=>{
  if(err)
    throw err;
});

next();
});


  app.use((req, res, next) => {
   
    const errorMessage = `404 Error: Route ${req.method} ${req.url} not found ${new Date().toISOString()} \n`;
  
    // Log the 404 error in the err.txt file
    fs.appendFile(path.join(logsDirectory, 'err.txt'), errorMessage, (err) => {
      if (err) {
        console.error('Error writing to err.txt:', err);
      }
    });
  
    // Respond with a 404 status and a message
    res.status(404).json({ message: "page not found" });
  });

app.use((err, req, res, next) => {

  const errormessage = `error  ${err.message}   ${new Date().toISOString()} \n`;

  fs.appendFile(
    path.join(logsDirectory, 'err.txt'),
    errormessage,
    (fsErr) => {
      if (fsErr) {
        console.error('Failed to write error log:', fsErr);
      }
    }
  );

  res.status(500).json({ message: "Something went wrong" });

});
//END CATCH MISTAKES

//PORT
 app.listen(port,()=>{
    console.log(`connected well to port ${port}`);
    })






