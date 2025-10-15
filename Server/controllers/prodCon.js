const mongoose = require('mongoose');
const Order=require('../models/orderModel')
const Product=require('../models/productsModel')
 
const CreateNewProduct = async (req, res) => {
    try {     
       
        const { name,  price, category, stock, productId} = req.body;

        if (!name || !price || !category||!productId) {
             return res.status(401).send({ "message": "name, price, category are required " });
         }


    
        const NewProduct = new Product({
            name: name,
            price:  price, 
            category: category,                     
            stock: stock,        
            productId:productId
        });
        
        await  NewProduct.save();

      res.json(NewProduct)

              
    } catch (error) { 
        console.log(error);
        res.status(500).json({ message: "failed to create new product" });
        
    }
};
const getAlluproduct = async (req, res) => {
    try {
      
        const product= await Product.find();  

        if (!product || product.length === 0) {  
            return res.status(404).json({"message": "no product found"});
        }
        
        res.json(product);  
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred while retrieving product" });
    }
};
const updateProduct = async (req, res) => {
    try {
        if (!req.body._id) {
            return res.status(400).json({ "message": "Product ID is required." });
        }

        const product = await Product.findOne({ _id: req.body._id }).exec();
        if (!product) {
            return res.status(404).json({ "message": `Product with ID ${req.body._id} not found.` });
        }

        // Update product fields if provided
        if (req.body.name) product.name = req.body.name;
        if (req.body.price) product.price = req.body.price;
        if (req.body.category) product.category = req.body.category; 
        if (req.body.stock) product.stock = req.body.stock;

        const result = await product.save();
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ "message": "Failed to update product." });
    }
};
 const deleteProduct = async(req, res) => {
        try{
          if(!req.body._id)
            return res.status(400).json({"message":"name is required"})
         
          const dproduct = await Product.findOne({ _id: req.body._id }).exec();
          console.log(dproduct);
          
        if (!dproduct) {
            return res.status(400).json({ "message": `the product id ${req.body._id} wasnt found` });
        }
       
        const result=await Product.deleteOne({_id:req.body._id})
            res.json(result)
    }
    catch(err){
      console.log(err);
      res.status(400).json({"message":"failed to delete product"})

    }
  };
const getProduct = async(req, res) => {
     const id = req.params.id; 
        const sproduct = await Product.findById(id).exec();
      console.log("Requested ID:", id);
    
        if (!sproduct) {
          return res.status(404).json({ message: `No user found with ID ${req.params.id}` });
        }
      
        res.json(sproduct);
  };
  
module.exports = {
    CreateNewProduct ,getAlluproduct,updateProduct,deleteProduct,getProduct  
  };
 