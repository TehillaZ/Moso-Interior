
const User = require('../models/userModel');
const mongoose = require('mongoose');


const addToCart = async (req, res) => {
  try {

    console.log(req.user);
    console.log(req.body);
    let { productId, quantity } = req.body;
    console.log("Received:", productId, quantity);

    // Check if productId is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(productId)) {
      productId = new mongoose.Types.ObjectId(productId);
    } else {
      return res.status(400).json({ message: "Invalid productId" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart.push({ productId, quantity });

    await user.save();

    res.json({ message: "Item added to cart", cart: user.cart });

  } catch (err) {
    console.error("Error while adding to cart:", err);
    res.status(500).json({ error: err.message });
  }
};


const viewCart = async (req, res) => {
  try {
    const email = req.userEmail;
    console.log(email);
    
     const user = await User.findOne({ email }).populate("cart.productId");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
     const email = req.userEmail;
    const {  productId } = req.params; // עכשיו מ־params, לא מ־body

    const user = await User.findOne({ email });
    console.log(user);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();

    res.json({ message: "Item removed", cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { viewCart, removeFromCart, addToCart };

