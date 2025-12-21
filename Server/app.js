const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const port = process.env.PORT;

// CONNECT TO MONGO
mongoose.connect(process.env.DB_CONNECT)
  .then(() => console.log('connected to mongoDB'))
  .catch(err => console.log(err));

// LOGS DIRECTORY
const logsDirectory = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDirectory)) fs.mkdirSync(logsDirectory);

// UPLOADS DIRECTORY
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// MIDDLEWARES
app.use(express.static("Client"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// CORS
const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://127.0.0.1:5501',
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:5501',
  'http://localhost:3284',
  'https://TehillaZ.github.io'
];
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

// SESSION
app.use(session({
  secret: "secret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// MULTER CONFIGURATION
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// STATIC FILES
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname, '../Client')));

// ROUTES
const { authenticateToken } = require('./middleware/middleware');
const authRoutes = require("./routes/api/auth");
app.use("/auth", authRoutes);
app.use('/users', require('./routes/api/users'));
app.use('/order', authenticateToken, require('./routes/api/orders'));
app.use('/product', authenticateToken, require('./routes/api/product'));
app.use('/login', require('./routes/api/logIn'));
const cartRoutes = require("./routes/api/cart");
app.use("/cart", authenticateToken, cartRoutes);
const refreshRoute = require('./routes/api/refreshJWT');
app.use('/refresh', refreshRoute);

// PRODUCT MODEL
const Product = require('./models/productsModel');

// IMAGE UPLOAD ROUTE
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const imageUrl = '/uploads/' + req.file.filename;

    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      imageUrl
    });

    await newProduct.save();
    res.json({ message: 'Uploaded successfully', product: newProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// LIST ALL IMAGES
app.get('/images', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Unable to scan files');
    const links = files.map(file => `<a href="/uploads/${file}">${file}</a>`).join('<br>');
    res.send(links);
  });
});

// GOOGLE LOGIN CONFIGURATION (UNCHANGED)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3284/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => done(null, profile)));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {

    res.redirect('/html/profile.html'); 
  }
);
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) console.error(err);
    res.redirect('/'); // הפנייה לדף הבית אחרי logout
  });
});

// EXAMPLE PAGES
app.get("/index.html", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));
app.get("/html/profile.html", (req, res) => res.sendFile(path.join(__dirname, "../Client/html/profile.html")));

// CATCH MISTAKES & LOGGING
app.use((req,res,next) => {
  const message = `request ${req.method} ${req.url} ${new Date().toISOString()}\n`;
  fs.appendFile(path.join(logsDirectory,'req.txt'), message, (err) => { if(err) throw err; });
  next();
});

app.use((req, res, next) => {
  const errorMessage = `404 Error: Route ${req.method} ${req.url} not found ${new Date().toISOString()}\n`;
  fs.appendFile(path.join(logsDirectory, 'err.txt'), errorMessage, () => {});
  res.status(404).json({ message: "page not found" });
});

app.use((err, req, res, next) => {
  const errormessage = `error ${err.message} ${new Date().toISOString()}\n`;
  fs.appendFile(path.join(logsDirectory, 'err.txt'), errormessage, () => {});
  res.status(500).json({ message: "Something went wrong" });
});

// START SERVER
app.listen(port, () => console.log(`connected well to port ${port}`));







