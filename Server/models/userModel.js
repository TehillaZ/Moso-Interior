
const mongoose=require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, default: 1,min:1 }
});

const userSchema = new mongoose.Schema(
{
  
  fullname:{
    type :String ,
    required:true 
  },
  address:{
    type :String ,
    required:true 
  },
  
  roles: {
    type: String, 
    enum: ['admin', 'user'], 
    default: 'user' 
},
  phone:{
    type: String,
    required:true,
    unique: true
  },
  email:{
    type :String ,
    required:true,
    unique: true
  },
 password:{
    type :String ,
    required:true
  },
  cart: [cartItemSchema]
}
)

module.exports =mongoose.model('User',userSchema)