const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  email: { 
    type: String,
     required: true 
    },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  finalPrice: { 
    type: Number,
     required: true 
    },
  orderDate: {
     type: Date,
      default: Date.now 
    },
  status: { 
    type: String, 
    enum: ['pending', 'shipped', 'delivered', 'cancelled', 'done'], default: 'pending' 
  }
});

module.exports = mongoose.model('Order', orderSchema);
